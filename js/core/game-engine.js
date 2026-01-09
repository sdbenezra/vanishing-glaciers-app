/**
 * Game Engine Module
 *
 * Core command processing system:
 * - Command input handling
 * - Keyword parsing
 * - Examine and talk mechanics
 * - Help, inventory, progress display
 *
 * Dependencies: game-state.js, ui-manager.js, save-manager.js, ai-integration.js
 * Chapter integration: Via setChapterFunctions() for chapter-specific content
 */

import { gameState } from '../shared/game-state.js';
import { addMessage, addSeparator, updateEvidenceDisplay, openEvidencePanel } from './ui-manager.js';
import { showSaveMenu } from './save-manager.js';
import { parseWithAI, executeAICommand } from './ai-integration.js';

// Temporary stubs for chapter-specific functions (will be set by chapter modules in Phase 8)
let showLocation = () => {
    console.log('[STUB] showLocation() - will be implemented by chapter module');
    addMessage('Location description not yet implemented.');
};

let getMayaGreeting = () => {
    console.log('[STUB] getMayaGreeting() - will be implemented by chapter module');
    return 'NPC greeting not yet implemented.';
};

let getMayaResponse = (topic) => {
    console.log('[STUB] getMayaResponse(' + topic + ') - will be implemented by chapter module');
    return 'NPC response not yet implemented.';
};

let showEvidenceToMaya = (evidenceId) => {
    console.log('[STUB] showEvidenceToMaya(' + evidenceId + ') - will be implemented by chapter module');
    return 'Evidence presentation not yet implemented.';
};

let checkChapterCompletion = () => {
    console.log('[STUB] checkChapterCompletion() - will be implemented by chapter module');
};

/**
 * Set chapter-specific functions (called by chapter modules)
 * @param {Object} functions - Object containing chapter-specific functions
 */
export function setChapterFunctions(functions) {
    if (functions.showLocation) showLocation = functions.showLocation;
    if (functions.getMayaGreeting) getMayaGreeting = functions.getMayaGreeting;
    if (functions.getMayaResponse) getMayaResponse = functions.getMayaResponse;
    if (functions.showEvidenceToMaya) showEvidenceToMaya = functions.showEvidenceToMaya;
    if (functions.checkChapterCompletion) checkChapterCompletion = functions.checkChapterCompletion;
}

// ============================================
// COMMAND PROCESSING
// ============================================

/**
 * Submit and process user command from input field
 */
export function submitCommand() {
    const input = document.getElementById('commandInput');
    const command = input.value.trim();

    // Handle special "waiting for enter" state (used by chapter endings)
    if (gameState.waitingForEnter) {
        gameState.waitingForEnter = false;
        if (gameState.enterCallback) {
            const callback = gameState.enterCallback;
            gameState.enterCallback = null;
            callback();
        }
        input.value = '';
        return; // Exit early
    }

    if (!command) return;

    addMessage(`> ${command}`, 'player-message');
    input.value = '';

    if (!gameState.gameStarted) {
        gameState.gameStarted = true;
    }

    processCommand(command.toLowerCase());
}

/**
 * Process command - handles AI mode and delegates to keyword processing
 * @param {string} command - User's command (lowercase)
 */
async function processCommand(command) {
    // Track commands
    if (gameState.commandsEntered !== undefined) {
        gameState.commandsEntered++;
    }

    // Handle SAVE command
    if (command.toLowerCase() === 'save') {
        showSaveMenu();
        return;
    }

    // Try AI parsing first if enabled
    if (gameState.aiMode && gameState.aiEngine) {
        try {
            addMessage('🤖 AI processing...', 'system-message');
            const parsed = await parseWithAI(command);

            if (parsed && executeAICommand(parsed)) {
                return; // AI successfully handled it
            }
            // If AI couldn't parse, fall through to keyword matching
            addMessage('🤖 AI couldn\'t parse that, trying keyword matching...', 'system-message');
        } catch (error) {
            console.error('AI error:', error);
            addMessage('🤖 AI error, using keyword matching...', 'warning-message');
        }
    }

    // Keyword-based parsing (fallback or default)
    processCommandKeywords(command);
}

/**
 * Process command using keyword matching
 * @param {string} command - User's command (lowercase)
 */
function processCommandKeywords(command) {
    // System commands
    if (['help', 'h', '?'].includes(command)) {
        showHelp();
        return;
    }

    if (['look', 'look around', 'l'].includes(command)) {
        showLocation();
        return;
    }

    if (['inventory', 'inv', 'i'].includes(command)) {
        showInventory();
        return;
    }

    if (['progress', 'status', 'p'].includes(command)) {
        showProgress();
        return;
    }

    // Examine commands
    if (command.startsWith('examine ') || command.startsWith('x ') || command.startsWith('look at ')) {
        handleExamine(command);
        return;
    }

    // Talk commands (including showing evidence)
    if (command.startsWith('talk') || command.startsWith('ask') || command.startsWith('speak') ||
        command.startsWith('show') || command.startsWith('present') || command.startsWith('give')) {
        handleTalk(command);
        return;
    }

    // Natural questions
    const questionIndicators = [
        'who', 'what', 'when', 'where', 'why', 'how',
        'tell me', 'explain', 'describe', 'about',
        'dr.', 'dr ', 'doctor', 'sarah', 'chen', 'maya', 'patel',
        'glacier', 'ice', 'temperature', 'research', 'data',
        'monitoring', 'sensor', 'missing', 'disappear',
        'matter', 'important', 'concern'
    ];

    if (questionIndicators.some(indicator => command.includes(indicator))) {
        handleTalk(command);
        return;
    }

    addMessage(`❓ I don't understand '${command}'. Type 'help' for available commands.`, 'warning-message');
}

// ============================================
// EXAMINATION SYSTEM
// ============================================

/**
 * Handle examine command
 * @param {string} command - The examine command
 */
function handleExamine(command) {
    const prefixes = ['examine ', 'x ', 'look at ', 'inspect ', 'check '];
    let target = command;

    for (const prefix of prefixes) {
        if (command.startsWith(prefix)) {
            target = command.substring(prefix.length).trim();
            break;
        }
    }

    // Normalize target - convert both underscores and multiple spaces to single space
    const targetNormalized = target.replace(/[_\s]+/g, ' ').toLowerCase().trim();

    console.log('Examining target:', targetNormalized);

    // Check interaction points
    for (const [pointId, point] of Object.entries(gameState.interactionPoints)) {
        // Normalize both the ID and name for comparison
        const pointIdNormalized = pointId.replace(/[_\s]+/g, ' ').toLowerCase().trim();
        const pointNameNormalized = point.name.replace(/[_\s]+/g, ' ').toLowerCase().trim();

        console.log('Checking against:', pointIdNormalized, 'and', pointNameNormalized);

        // Check if target matches ID or name (partial match in either direction)
        if (targetNormalized === pointIdNormalized ||
            targetNormalized === pointNameNormalized ||
            targetNormalized.includes(pointIdNormalized) ||
            targetNormalized.includes(pointNameNormalized) ||
            pointIdNormalized.includes(targetNormalized) ||
            pointNameNormalized.includes(targetNormalized)) {
            console.log('Match found!');
            examineInteractionPoint(point);
            return;
        }
    }

    // Check discovered evidence
    for (const [evidenceId, evidence] of Object.entries(gameState.evidence)) {
        if (evidence.discovered) {
            const evidenceIdNormalized = evidenceId.replace(/[_\s]+/g, ' ').toLowerCase().trim();
            const evidenceNameNormalized = evidence.name.replace(/[_\s]+/g, ' ').toLowerCase().trim();

            if (targetNormalized === evidenceIdNormalized ||
                targetNormalized === evidenceNameNormalized ||
                targetNormalized.includes(evidenceIdNormalized) ||
                targetNormalized.includes(evidenceNameNormalized) ||
                evidenceIdNormalized.includes(targetNormalized) ||
                evidenceNameNormalized.includes(targetNormalized)) {
                examineEvidenceDetailed(evidence);
                return;
            }
        }
    }

    console.log('No match found for:', targetNormalized);
    addMessage(`❓ You don't see '${target}' here. Try examining: monitoring station, workstation, equipment rack, storage freezer, satellite display, or window.`, 'warning-message');
}

/**
 * Examine an interaction point and potentially discover evidence
 * @param {Object} point - The interaction point to examine
 */
function examineInteractionPoint(point) {
    let message = `🔍 ${point.name.toUpperCase()}\n\n${point.description}`;
    point.examined = true;

    if (point.evidenceId && !gameState.discoveredEvidence.has(point.evidenceId)) {
        const evidence = gameState.evidence[point.evidenceId];
        gameState.discoveredEvidence.add(point.evidenceId);
        evidence.discovered = true;

        message += `\n\n✓ EVIDENCE DISCOVERED: ${evidence.name}\n\n${evidence.description}`;
        message += `\n\n💡 TIP: Use 'examine ${point.evidenceId.replace(/_/g, ' ')}' to study this evidence in detail.`;

        addMessage(message, 'success-message');
        updateEvidenceDisplay();
        openEvidencePanel(); // Auto-open when evidence found!
    } else if (point.evidenceId && gameState.discoveredEvidence.has(point.evidenceId)) {
        const evidence = gameState.evidence[point.evidenceId];
        message += `\n\n[You've already found: ${evidence.name}]`;
        message += `\nUse 'examine ${point.evidenceId.replace(/_/g, ' ')}' to review it in detail.`;
        addMessage(message);
    } else {
        addMessage(message);
    }
}

/**
 * Examine evidence in detail and learn climate concepts
 * @param {Object} evidence - The evidence to examine
 */
function examineEvidenceDetailed(evidence) {
    let message = `🔬 DETAILED ANALYSIS: ${evidence.name.toUpperCase()}\n\n${evidence.detailedInfo}`;

    if (!evidence.examined) {
        gameState.examinedEvidence.add(evidence.id);
        evidence.examined = true;

        // Track climate concepts learned from each piece of evidence
        if (evidence.id === 'temperature_data') {
            gameState.learnedConcepts.add('glacier_temperature_monitoring');
        } else if (evidence.id === 'calibration_log') {
            gameState.learnedConcepts.add('data_verification');
        } else if (evidence.id === 'sarah_note') {
            gameState.learnedConcepts.add('glacier_melting_impacts');
        } else if (evidence.id === 'ice_core_sample') {
            gameState.learnedConcepts.add('ice_core_climate_archives');
        } else if (evidence.id === 'satellite_thermal_image') {
            gameState.learnedConcepts.add('remote_sensing_thermal_imaging');
        }

        message += `\n${evidence.climateLesson}`;
        message += `\n\n✓ Evidence examined and climate concept learned!`;
        addMessage(message, 'success-message');
        updateEvidenceDisplay();

        // Check if chapter is complete
        if (typeof checkChapterCompletion === 'function') {
            checkChapterCompletion();
        }
    } else {
        message += '\n\n[You\'ve already studied this evidence in detail.]';
        addMessage(message);
    }
}

// ============================================
// TALK SYSTEM
// ============================================

/**
 * Handle talk commands
 * @param {string} command - The talk command
 */
function handleTalk(command) {
    // Check if user is trying to show evidence
    if (command.includes('show') || command.includes('present')) {
        // Extract evidence name
        for (const [evidenceId, evidence] of Object.entries(gameState.evidence)) {
            const evidenceName = evidence.name.toLowerCase();
            const evidenceIdNorm = evidenceId.replace(/_/g, ' ');

            if (command.includes(evidenceName) || command.includes(evidenceIdNorm)) {
                const response = showEvidenceToMaya(evidenceId);
                addMessage(response);
                return;
            }
        }

        // If "show" was mentioned but no evidence matched
        addMessage(`🗣️  Dr. Patel:

"What would you like to show me? If you've found evidence, try 'show [evidence name] to maya'."`);
        return;
    }

    let topic = '';

    if (command.includes('about')) {
        topic = command.split('about')[1].trim();
    } else if (command.includes('to maya') || command.includes('maya')) {
        if (gameState.topicsDiscussed.size === 0) {
            const greeting = getMayaGreeting();
            addMessage(greeting);
            gameState.talkedToMaya = true;
            return;
        } else {
            topic = '';
        }
    } else {
        // Extract topic from question - pass the whole command
        topic = command;
    }

    const response = getMayaResponse(topic);
    addMessage(response);
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

/**
 * Show help text
 */
export function showHelp() {
    const help = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVIGATION & OBSERVATION:
  look                    - Describe your current location
  examine [object]        - Examine something closely

EVIDENCE:
  inventory              - List evidence you've discovered
  examine [evidence]     - Study evidence in detail

INTERACTION:
  talk to maya           - Speak with Dr. Patel
  You can also just ask questions naturally!

SYSTEM:
  progress               - View investigation progress
  save                   - Save your progress
  help                   - Show this help message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    addMessage(help);
}

/**
 * Show inventory of discovered evidence
 */
export function showInventory() {
    if (gameState.discoveredEvidence.size === 0) {
        addMessage("📋 EVIDENCE LOG\n\nYou haven't discovered any evidence yet.");
        return;
    }

    let inventory = "📋 EVIDENCE LOG\n\n";
    for (const evidenceId of gameState.discoveredEvidence) {
        const evidence = gameState.evidence[evidenceId];
        const status = evidence.examined ? "✓ Examined" : "○ Not yet examined";
        inventory += `  ${status} - ${evidence.name}\n`;
    }
    inventory += "\nUse 'examine [evidence name]' to study evidence in detail.";
    addMessage(inventory);
}

/**
 * Show investigation progress
 */
export function showProgress() {
    const total = Object.keys(gameState.evidence).length;
    const found = gameState.discoveredEvidence.size;
    const examined = gameState.examinedEvidence.size;

    let progress = `
📋 INVESTIGATION PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evidence found: ${found} of ${total}.
Evidence examined: ${examined} of ${total}.
Climate concepts learned: ${gameState.learnedConcepts.size}.
Talked to Dr. Patel: ${gameState.talkedToMaya ? 'Yes' : 'No'}.
`;

    if (found === total && examined === total) {
        progress += "\n→ You've found all the evidence. Talk to Dr. Patel to piece it together.";
    } else {
        progress += "\n→ Continue investigating. There's more to discover.";
    }

    addMessage(progress);
}

/**
 * Show victory message
 */
export function showVictory() {
    const victory = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 MYSTERY SOLVED! 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Congratulations! You've pieced together what happened to Dr. Sarah Chen.

THE SOLUTION:

Dr. Chen discovered critical evidence of accelerated glacier melting -
temperature increases in ancient ice layers that far exceeded predictions.

She verified the data wasn't equipment error. When confirmed genuine, she
realized the implications were severe: the glacier could destabilize within
months, affecting sea levels and local ecosystems.

She went to sector 7-B to collect direct physical evidence that would prove
her findings beyond doubt.

This wasn't a mysterious disappearance - it was a dedicated scientist following
the data, committed to getting the truth right before sharing it with the world.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for playing Chapter 1 of The Vanishing Glaciers!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    addMessage(victory, 'success-message');

    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = 'STATUS: ✓ INVESTIGATION COMPLETE';
        statusElement.style.color = '#81c784';
    }

    const commandInput = document.getElementById('commandInput');
    if (commandInput) {
        commandInput.disabled = true;
    }
}

/**
 * Initialize command input event listener
 */
export function initializeCommandInput() {
    const commandInput = document.getElementById('commandInput');
    if (commandInput) {
        commandInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitCommand();
            }
        });
    }
}
