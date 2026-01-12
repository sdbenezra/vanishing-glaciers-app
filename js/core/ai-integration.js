/**
 * AI Integration Module
 *
 * Handles Web-LLM AI integration for natural language parsing:
 * - WebGPU support detection
 * - AI model loading (Phi-3-mini)
 * - Natural language command parsing
 * - AI command execution
 *
 * Dependencies: game-state.js, ui-manager.js
 * Future: Will import game command functions in Phase 7-8
 */

import { gameState } from '../shared/game-state.js';
import { addMessage } from './ui-manager.js';

// Import game command functions from game-engine (available from Phase 7)
// We use dynamic references via setGameCommandFunctions() to avoid circular dependencies
let showLocation = null;
let processCommand = null;
let showInventory = null;
let showProgress = null;
let showHelp = null;

/**
 * Set game command functions (called by game-engine on initialization)
 * @param {Object} functions - Object containing game command functions
 */
export function setGameCommandFunctions(functions) {
    if (functions.showLocation) showLocation = functions.showLocation;
    if (functions.processCommand) processCommand = functions.processCommand;
    if (functions.showInventory) showInventory = functions.showInventory;
    if (functions.showProgress) showProgress = functions.showProgress;
    if (functions.showHelp) showHelp = functions.showHelp;
}

// ============================================
// AI MODE - WEB-LLM INTEGRATION
// ============================================

/**
 * Check if WebGPU is supported in the browser
 * @returns {boolean} True if WebGPU is available
 */
export function supportsWebGPU() {
    return 'gpu' in navigator;
}

/**
 * Toggle AI Mode on/off
 */
export async function toggleAIMode() {
    if (gameState.aiLoading) {
        return; // Already loading
    }

    const button = document.getElementById('aiToggle');
    const buttonText = document.getElementById('aiToggleText');

    if (!button || !buttonText) {
        console.warn('AI toggle button elements not found');
        return;
    }

    if (gameState.aiMode) {
        // Turn off AI mode
        gameState.aiMode = false;
        button.classList.remove('active');
        buttonText.textContent = 'AI OFF';
        addMessage('🤖 AI Mode disabled. Using keyword-based parsing.', 'system-message');
    } else {
        // Try to turn on AI mode
        if (!supportsWebGPU()) {
            addMessage('❌ AI Mode requires WebGPU support. Your browser may not support it yet. Using keyword mode instead.', 'warning-message');
            return;
        }

        // Load AI model
        await loadAIModel();
    }
}

/**
 * Load the Web-LLM model (Phi-3-mini)
 */
export async function loadAIModel() {
    const button = document.getElementById('aiToggle');
    const buttonText = document.getElementById('aiToggleText');
    const overlay = document.getElementById('loadingOverlay');
    const loadingBar = document.getElementById('loadingBar');
    const loadingSubtext = document.getElementById('loadingSubtext');

    // Check for required elements
    if (!button || !buttonText) {
        console.warn('AI toggle elements not found');
        return;
    }

    try {
        gameState.aiLoading = true;
        button.classList.add('loading');
        buttonText.textContent = 'LOADING...';
        if (overlay) overlay.classList.add('active');

        // Dynamically import Web-LLM
        const webllm = await import('https://esm.run/@mlc-ai/web-llm');

        // Progress callback
        const initProgressCallback = (progress) => {
            const percent = Math.round(progress.progress * 100);
            if (loadingBar) loadingBar.style.width = percent + '%';
            if (loadingSubtext) loadingSubtext.textContent = progress.text || 'Loading...';
        };

        // Create engine with Phi-3-mini (small, fast model)
        if (loadingSubtext) loadingSubtext.textContent = 'Initializing AI engine...';
        gameState.aiEngine = await webllm.CreateMLCEngine(
            "Phi-3-mini-4k-instruct-q4f16_1-MLC",
            {
                initProgressCallback: initProgressCallback,
                logLevel: "ERROR" // Reduce console spam
            }
        );

        // Success!
        gameState.aiMode = true;
        gameState.aiLoading = false;
        button.classList.remove('loading');
        button.classList.add('active');
        buttonText.textContent = 'AI ON';
        if (overlay) overlay.classList.remove('active');

        addMessage('✅ AI Mode enabled! You can now use natural language. The AI understands context and can parse complex questions.', 'success-message');

    } catch (error) {
        console.error('AI Model loading failed:', error);
        gameState.aiLoading = false;
        button.classList.remove('loading');
        buttonText.textContent = 'AI OFF';
        if (overlay) overlay.classList.remove('active');

        addMessage('❌ Failed to load AI model: ' + error.message + '\nUsing keyword mode instead.', 'warning-message');
    }
}

/**
 * Parse command using AI
 * @param {string} userInput - User's natural language input
 * @returns {Object|null} Parsed command object or null if parsing fails
 */
export async function parseWithAI(userInput) {
    if (!gameState.aiEngine) {
        return null;
    }

    try {
        // Create a prompt that helps the AI understand game commands
        const systemPrompt = `You are a command parser for a text adventure game. The player investigates Dr. Sarah Chen's disappearance at an Arctic research station.

Available actions:
- LOOK: Describe surroundings
- EXAMINE [object]: Inspect something (objects: monitoring_station, workstation, equipment_rack, storage_freezer, satellite_display, window, temperature_data, calibration_log, sarah_note, ice_core_sample, satellite_thermal_image, tablet)
- TALK [topic]: Discuss with Dr. Maya Patel (topics: glaciers, research, monitoring, data, sarah, disappearance, importance, ice cores)
- INVENTORY: Show collected evidence
- PROGRESS: Show investigation status
- HELP: Show help

Special commands:
- "read tablet" or "view tablet": Read Dr. Chen's decrypted notes (use action "read_tablet")
- "examine tablet": Check the tablet device (use action "examine" with target "tablet")
- "unlock tablet": Start tablet unlock sequence (use action "unlock_tablet")

Parse the user's input into ONE of these commands. Return ONLY a JSON object with this format:
{"action": "examine", "target": "monitoring_station"}
or
{"action": "talk", "topic": "glaciers"}
or
{"action": "look"}
or
{"action": "read_tablet"}

Be flexible with natural language. Examples:
"tell me about the glacier work" → {"action": "talk", "topic": "glaciers"}
"check the computer" → {"action": "examine", "target": "workstation"}
"what happened to dr chen" → {"action": "talk", "topic": "sarah"}
"why does this matter" → {"action": "talk", "topic": "importance"}
"why is this important" → {"action": "talk", "topic": "importance"}
"why does this work matter" → {"action": "talk", "topic": "importance"}
"tell me about the research" → {"action": "talk", "topic": "research"}
"look at the ice samples" → {"action": "examine", "target": "storage_freezer"}
"examine the freezer" → {"action": "examine", "target": "storage_freezer"}
"what about ice cores" → {"action": "talk", "topic": "ice cores"}
"read tablet" → {"action": "read_tablet"}
"view tablet" → {"action": "read_tablet"}
"examine tablet" → {"action": "examine", "target": "tablet"}`;

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput }
        ];

        const response = await gameState.aiEngine.chat.completions.create({
            messages: messages,
            temperature: 0.3, // Lower temperature for more consistent parsing
            max_tokens: 100
        });

        const aiResponse = response.choices[0].message.content.trim();

        // Try to extract JSON from response
        const jsonMatch = aiResponse.match(/\{[^}]+\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed;
        }

        return null;
    } catch (error) {
        console.error('AI parsing error:', error);
        return null;
    }
}

/**
 * Execute AI-parsed command
 * @param {Object} parsedCommand - Parsed command object from AI
 * @returns {boolean} True if command was executed successfully
 */
export function executeAICommand(parsedCommand) {
    console.log('executeAICommand called with:', parsedCommand);

    if (!parsedCommand || !parsedCommand.action) {
        console.log('No action found in parsed command');
        return false;
    }

    const action = parsedCommand.action.toLowerCase();
    console.log('Action:', action, 'Topic/Target:', parsedCommand.topic || parsedCommand.target);

    switch (action) {
        case 'look':
            if (showLocation) {
                showLocation();
                return true;
            }
            return false;

        case 'examine':
        case 'look_at':
        case 'inspect':
            if (parsedCommand.target && processCommand) {
                // Normalize the target to match game objects
                const target = parsedCommand.target.replace(/_/g, ' ').toLowerCase();
                processCommand('examine ' + target);
                return true;
            }
            return false;

        case 'talk':
            if (processCommand) {
                if (parsedCommand.topic) {
                    processCommand('talk ' + parsedCommand.topic);
                    return true;
                }
                // Default talk to Maya
                processCommand('talk maya');
                return true;
            }
            return false;

        case 'inventory':
            if (showInventory) {
                showInventory();
                return true;
            }
            return false;

        case 'progress':
            if (showProgress) {
                showProgress();
                return true;
            }
            return false;

        case 'help':
            if (showHelp) {
                showHelp();
                return true;
            }
            return false;

        case 'read_tablet':
            if (processCommand) {
                processCommand('read tablet');
                return true;
            }
            return false;

        case 'unlock_tablet':
            if (processCommand) {
                processCommand('unlock tablet');
                return true;
            }
            return false;

        default:
            return false;
    }
}
