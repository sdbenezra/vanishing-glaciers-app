/**
 * Menu Manager Module
 *
 * Handles all menu and settings functionality:
 * - Main menu display
 * - New game / Continue game
 * - Settings modal
 * - About modal
 * - Return to menu
 *
 * Dependencies: game-state.js, save-manager.js, ui-manager.js
 * Future: Will import game initialization and chapter functions in Phase 7-8
 */

import { gameState } from '../shared/game-state.js';
import {
    loadGame,
    syncEvidenceState,
    startAutoSave,
    stopAutoSave,
    gameSettings,
    saveSettings
} from './save-manager.js';
import { updateEvidenceDisplay, addMessage } from './ui-manager.js';

// Temporary stubs for functions that will be available in later phases
let initializeGame = () => {
    console.log('[STUB] initializeGame() - will be implemented in Phase 7');
};

let showIntro = () => {
    console.log('[STUB] showIntro() - will be implemented in Phase 8');
};

let showLocation = () => {
    console.log('[STUB] showLocation() - will be implemented in Phase 8');
};

let clearGameOutput = () => {
    const chatDisplay = document.getElementById('chatDisplay');
    if (chatDisplay) {
        chatDisplay.innerHTML = '';
    }
};

/**
 * Set initialization functions (called by game-engine/chapter modules later)
 * @param {Object} functions - Object containing initializeGame, showIntro, showLocation, etc.
 */
export function setGameFunctions(functions) {
    if (functions.initializeGame) initializeGame = functions.initializeGame;
    if (functions.showIntro) showIntro = functions.showIntro;
    if (functions.showLocation) showLocation = functions.showLocation;
    if (functions.clearGameOutput) clearGameOutput = functions.clearGameOutput;
}

// =====================================
// MAIN MENU FUNCTIONS
// =====================================

/**
 * Show the main menu
 */
export function showMainMenu() {
    // Hide game container
    document.getElementById('gameContainer').classList.add('hidden');

    // Show main menu
    document.getElementById('mainMenu').classList.remove('hidden');

    // Check if there's a save to enable continue button
    updateContinueButton();

    // Stop auto-save
    stopAutoSave();
}

/**
 * Hide the main menu
 */
export function hideMainMenu() {
    // Hide main menu
    document.getElementById('mainMenu').classList.add('hidden');

    // Show game container
    document.getElementById('gameContainer').classList.remove('hidden');
}

/**
 * Update the continue button state based on available saves
 */
export function updateContinueButton() {
    const continueButton = document.getElementById('continueButton');

    if (!continueButton) return;

    // Check for most recent save
    const lastSave = localStorage.getItem('vg_last_save');
    const autoSave = localStorage.getItem('vg_save_-1');

    if (lastSave !== null || autoSave !== null) {
        continueButton.disabled = false;
    } else {
        continueButton.disabled = true;
    }
}

/**
 * Continue from the most recent save
 */
export function continueGame() {
    // Find most recent save
    let slotToLoad = -1; // Default to auto-save

    const lastSave = localStorage.getItem('vg_last_save');
    if (lastSave !== null) {
        const saveData = localStorage.getItem(`vg_save_${lastSave}`);
        if (saveData) {
            slotToLoad = parseInt(lastSave);
        }
    }

    // Hide menu, show game
    hideMainMenu();

    // Load the save
    if (loadGame(slotToLoad)) {
        // Initialize the chapter to set up interaction points and evidence
        initializeGame();

        // Sync evidence state after initialization (because initializeGame reloads fresh evidence)
        syncEvidenceState();

        // Show game resumed message and current location
        addMessage("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'system-message', true);
        addMessage("🎮 GAME RESUMED", 'system-message');
        addMessage("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'system-message', true);
        showLocation();

        startAutoSave();
    }
}

/**
 * Start a new game
 */
export function startNewGame() {
    // Confirm if there's unsaved progress
    if (gameState.gameStarted && !gameState.chapterComplete) {
        if (!confirm('Starting a new game will erase current progress. Continue?')) {
            return;
        }
    }

    // Hide menu, show game
    hideMainMenu();

    // Reset and start new game
    gameState.discoveredEvidence = new Set();
    gameState.examinedEvidence = new Set();
    gameState.learnedConcepts = new Set();
    gameState.topicsDiscussed = new Set();
    gameState.commandsEntered = 0;
    gameState.hintsUsed = 0;
    gameState.endingTriggered = false;
    gameState.chapterComplete = false;
    gameState.gameStarted = true;
    gameState.gameStartTime = new Date();
    gameState.playTimeSeconds = 0;
    gameState.talkedToMaya = false;

    // Reset tablet state
    gameState.tabletState = {
        discovered: false,
        unlockAttempted: false,
        questionsAnswered: 0,
        correctAnswers: 0,
        currentQuestionIndex: 0,
        questions: [],
        wrongAttempts: {},
        unlocked: false,
        noteRead: false
    };

    // Clear game output
    clearGameOutput();

    // Initialize chapter with fresh data (creates new copies of evidence/interaction points)
    initializeGame();

    // Update evidence display
    updateEvidenceDisplay();
    startAutoSave();
}

/**
 * Return to main menu
 */
export function returnToMainMenu() {
    // Confirm if game in progress
    if (gameState.gameStarted && !gameState.chapterComplete) {
        if (!confirm('Return to main menu? Unsaved progress will be lost.')) {
            return;
        }
    }

    // Stop auto-save
    stopAutoSave();

    // Show main menu
    showMainMenu();
}

/**
 * Return to main menu from chapter ending
 */
export function returnToMainMenuFromEnding() {
    // Close chapter complete modal
    const modal = document.getElementById('chapterCompleteModal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Clear game output
    clearGameOutput();

    // Stop auto-save
    stopAutoSave();

    // Show main menu
    showMainMenu();
}

// =====================================
// SETTINGS AND ABOUT
// =====================================

/**
 * Show settings modal
 */
export function showSettings() {
    const modal = document.getElementById('saveModal');
    const title = document.getElementById('saveModalTitle');
    const content = document.getElementById('saveModalContent');

    if (!modal || !title || !content) return;

    title.textContent = '⚙️ Settings';

    content.innerHTML = `
        <div style="color: #a8c5da;">
            <h3 style="color: #4dd0e1; margin-bottom: 15px;">Game Settings</h3>

            <div style="margin: 20px 0; padding: 15px; background: #2a3f5f; border-radius: 5px;">
                <label style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Auto-Save Enabled</span>
                    <input type="checkbox" ${gameSettings.autoSaveEnabled ? 'checked' : ''}
                        onchange="toggleAutoSave(this.checked)" style="width: 20px; height: 20px;">
                </label>
            </div>

            <div style="margin: 20px 0; padding: 15px; background: #2a3f5f; border-radius: 5px;">
                <label style="display: block; margin-bottom: 10px;">
                    Auto-Save Interval: <span id="intervalDisplay">${gameSettings.autoSaveInterval / 60000}</span> minutes
                </label>
                <input type="range" min="1" max="10" value="${gameSettings.autoSaveInterval / 60000}"
                    oninput="updateAutoSaveInterval(this.value)" style="width: 100%;">
            </div>

            <div style="margin: 20px 0; padding: 15px; background: #2a3f5f; border-radius: 5px;">
                <label style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Text-to-Speech Enabled</span>
                    <input type="checkbox" ${gameSettings.ttsEnabled ? 'checked' : ''}
                        onchange="gameSettings.ttsEnabled = this.checked; if (window.speechEnabled !== undefined) { window.speechEnabled = this.checked; } saveSettings();"
                        style="width: 20px; height: 20px;">
                </label>
            </div>

            <div style="margin: 20px 0; padding: 15px; background: #2a3f5f; border-radius: 5px;">
                <label style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Hints Enabled</span>
                    <input type="checkbox" ${gameSettings.hintsEnabled ? 'checked' : ''}
                        onchange="gameSettings.hintsEnabled = this.checked; saveSettings();"
                        style="width: 20px; height: 20px;">
                </label>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #81c784;">
                💡 Settings are saved automatically.
            </p>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Show about modal
 */
export function showAbout() {
    const modal = document.getElementById('saveModal');
    const title = document.getElementById('saveModalTitle');
    const content = document.getElementById('saveModalContent');

    if (!modal || !title || !content) return;

    title.textContent = '❓ About The Vanishing Glaciers';

    content.innerHTML = `
        <div style="color: #a8c5da; line-height: 1.8;">
            <p style="margin-bottom: 15px;">
                <strong style="color: #4dd0e1;">The Vanishing Glaciers</strong> is an educational environmental mystery game
                that teaches climate science through interactive storytelling.
            </p>

            <h3 style="color: #4dd0e1; margin: 20px 0 10px 0;">Chapter 1: The Disappearance</h3>
            <p style="margin-bottom: 15px;">
                Investigate the mysterious disappearance of Dr. Sarah Chen, a glaciologist at an Arctic research station.
                Gather evidence, learn about climate science, and uncover the truth.
            </p>

            <h3 style="color: #4dd0e1; margin: 20px 0 10px 0;">Commands</h3>
            <p style="font-family: 'Courier New', monospace; background: #1a2332; padding: 10px; border-radius: 5px; font-size: 12px;">
                EXAMINE [object] - Inspect items<br>
                TALK [topic] - Discuss with Dr. Patel<br>
                INVENTORY - View evidence<br>
                PROGRESS - Check status<br>
                SAVE - Save progress<br>
                HELP - View all commands
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #2a3f5f; text-align: center; font-size: 12px;">
                <p style="color: #81c784;">
                    🌍 Making climate science accessible through interactive storytelling
                </p>
                <p style="margin-top: 10px;">
                    Version 1.0.0 | Chapter 1 of 5
                </p>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Toggle auto-save setting
 * @param {boolean} enabled - Whether auto-save should be enabled
 */
export function toggleAutoSave(enabled) {
    gameSettings.autoSaveEnabled = enabled;
    saveSettings();

    if (enabled) {
        startAutoSave();
    } else {
        stopAutoSave();
    }
}

/**
 * Update auto-save interval
 * @param {number} minutes - Auto-save interval in minutes
 */
export function updateAutoSaveInterval(minutes) {
    const display = document.getElementById('intervalDisplay');
    if (display) {
        display.textContent = minutes;
    }

    gameSettings.autoSaveInterval = minutes * 60000;
    saveSettings();

    if (gameSettings.autoSaveEnabled) {
        startAutoSave();
    }
}

/**
 * Preview the next chapter
 */
export function previewNextChapter() {
    hideMainMenu();

    // Call the chapter 2 teaser function (available globally from chapter1-ending.js)
    if (typeof window.showChapter2Teaser === 'function') {
        window.showChapter2Teaser();
    } else {
        console.error('showChapter2Teaser function not available');
    }
}

// Make functions globally available for onclick handlers in HTML
// This is necessary because the HTML buttons use onclick="functionName()"
if (typeof window !== 'undefined') {
    window.showSettings = showSettings;
    window.showAbout = showAbout;
    window.toggleAutoSave = toggleAutoSave;
    window.updateAutoSaveInterval = updateAutoSaveInterval;
    window.previewNextChapter = previewNextChapter;
}
