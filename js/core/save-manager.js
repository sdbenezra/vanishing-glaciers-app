/**
 * Save Manager Module
 *
 * Handles all save/load functionality:
 * - Save game to localStorage slots
 * - Load game from slots
 * - Auto-save system
 * - Import/export saves
 * - Save/load UI
 *
 * Dependencies: game-state.js, ui-manager.js
 * Future: Will import triggerChapterEnding from chapter1-ending.js in Phase 8
 */

import { gameState } from '../shared/game-state.js';
import { addMessage, updateEvidenceDisplay } from './ui-manager.js';
import { hideMainMenu } from './menu-manager.js';

// Function stubs that will be set by main.js
let initializeGame = () => {
    console.log('[STUB] initializeGame() - will be set by main.js');
};

let showLocation = () => {
    console.log('[STUB] showLocation() - will be set by main.js');
};

/**
 * Set game initialization functions (called by main.js)
 * @param {Object} functions - Object containing initializeGame, showLocation, etc.
 */
export function setSaveManagerGameFunctions(functions) {
    if (functions.initializeGame) initializeGame = functions.initializeGame;
    if (functions.showLocation) showLocation = functions.showLocation;
}

// ====================================
// CONSTANTS
// ====================================

export const GAME_VERSION = "1.0.0";
export const MAX_SAVE_SLOTS = 5;
export const AUTO_SAVE_INTERVAL = 180000; // 3 minutes in milliseconds

// ====================================
// SETTINGS
// ====================================

export const gameSettings = {
    autoSaveEnabled: true,
    autoSaveInterval: AUTO_SAVE_INTERVAL,
    ttsEnabled: true,
    sttEnabled: true,
    hintsEnabled: true
};

let autoSaveTimer = null;

// Temporary stub for triggerChapterEnding - will be replaced in Phase 8
let triggerChapterEnding = () => {
    console.log('[STUB] triggerChapterEnding() - will be implemented in Phase 8');
};

/**
 * Set the triggerChapterEnding function (called by chapter ending module)
 * @param {Function} fn - The triggerChapterEnding function
 */
export function setTriggerChapterEndingFunction(fn) {
    triggerChapterEnding = fn;
}

// ====================================
// SAVE DATA CREATION AND MANAGEMENT
// ====================================

/**
 * Create save data object
 * @param {string} slotName - Name for this save
 * @returns {Object} Save data object
 */
export function createSaveData(slotName = "Auto Save") {
    const now = new Date();
    const playTime = gameState.gameStartTime ?
        Math.floor((now - gameState.gameStartTime) / 1000) + gameState.playTimeSeconds :
        gameState.playTimeSeconds;

    return {
        metadata: {
            version: GAME_VERSION,
            chapter: 1,
            timestamp: now.toISOString(),
            slotName: slotName,
            playTime: playTime
        },
        gameProgress: {
            discoveredEvidence: Array.from(gameState.discoveredEvidence),
            examinedEvidence: Array.from(gameState.examinedEvidence),
            learnedConcepts: Array.from(gameState.learnedConcepts),
            topicsDiscussed: Array.from(gameState.topicsDiscussed),
            talkedToMaya: gameState.talkedToMaya,
            gameStarted: gameState.gameStarted,
            commandsEntered: gameState.commandsEntered,
            hintsUsed: gameState.hintsUsed,
            endingTriggered: gameState.endingTriggered,
            chapterComplete: gameState.chapterComplete,
            interactionPoints: gameState.interactionPoints,
            tabletState: {
                discovered: gameState.tabletState.discovered,
                unlocked: gameState.tabletState.unlocked,
                noteRead: gameState.tabletState.noteRead,
                questionsAnswered: gameState.tabletState.questionsAnswered,
                correctAnswers: gameState.tabletState.correctAnswers
            }
        },
        statistics: {
            evidenceFound: gameState.discoveredEvidence.size,
            evidenceExamined: gameState.examinedEvidence.size,
            climateConceptsLearned: gameState.learnedConcepts.size,
            commandsEntered: gameState.commandsEntered,
            hintsUsed: gameState.hintsUsed,
            playTimeSeconds: playTime
        }
    };
}

/**
 * Save game to a slot
 * @param {number} slotNumber - Slot number (-1 for auto-save, 0-4 for manual saves)
 * @param {string|null} slotName - Optional custom name for the save
 * @returns {boolean} True if save succeeded
 */
export function saveGame(slotNumber = 0, slotName = null) {
    try {
        const saveData = createSaveData(slotName || `Save ${slotNumber + 1}`);
        const saveKey = `vg_save_${slotNumber}`;
        localStorage.setItem(saveKey, JSON.stringify(saveData));
        localStorage.setItem('vg_last_save', slotNumber.toString());

        if (slotNumber === -1) {
            showAutoSaveIndicator();
        } else {
            addMessage(`💾 Game saved to slot ${slotNumber + 1}!`, 'system-message');
        }

        return true;
    } catch (error) {
        console.error('Save failed:', error);
        addMessage('⚠️ Failed to save game. Please check your browser storage.', 'error-message');
        return false;
    }
}

/**
 * Auto-save the game
 */
export function autoSave() {
    if (gameSettings.autoSaveEnabled && gameState.gameStarted && !gameState.chapterComplete) {
        saveGame(-1, 'Auto Save');
    }
}

/**
 * Show auto-save indicator
 */
export function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.classList.add('saving');
        setTimeout(() => {
            indicator.classList.remove('saving');
        }, 2000);
    }
}

/**
 * Sync evidence object properties with the Sets
 * Call this after initializeGame() to restore evidence state from a loaded save
 */
export function syncEvidenceState() {
    // Sync discovered evidence
    for (const evidenceId of gameState.discoveredEvidence) {
        if (gameState.evidence[evidenceId]) {
            gameState.evidence[evidenceId].discovered = true;
        }
    }

    // Sync examined evidence
    for (const evidenceId of gameState.examinedEvidence) {
        if (gameState.evidence[evidenceId]) {
            gameState.evidence[evidenceId].examined = true;
        }
    }

    // Update the UI to reflect the synced state
    updateEvidenceDisplay();
}

/**
 * Load game from a slot
 * @param {number} slotNumber - Slot number to load from
 * @returns {boolean} True if load succeeded
 */
export function loadGame(slotNumber) {
    try {
        const saveKey = `vg_save_${slotNumber}`;
        const saveData = JSON.parse(localStorage.getItem(saveKey));

        if (!saveData) {
            addMessage('⚠️ No save data found in this slot.', 'error-message');
            return false;
        }

        // Restore game state
        gameState.discoveredEvidence = new Set(saveData.gameProgress.discoveredEvidence);
        gameState.examinedEvidence = new Set(saveData.gameProgress.examinedEvidence);
        gameState.learnedConcepts = new Set(saveData.gameProgress.learnedConcepts);
        gameState.topicsDiscussed = new Set(saveData.gameProgress.topicsDiscussed);
        gameState.talkedToMaya = saveData.gameProgress.talkedToMaya;
        gameState.gameStarted = saveData.gameProgress.gameStarted;
        gameState.commandsEntered = saveData.gameProgress.commandsEntered;
        gameState.hintsUsed = saveData.gameProgress.hintsUsed;
        gameState.endingTriggered = saveData.gameProgress.endingTriggered;
        gameState.chapterComplete = saveData.gameProgress.chapterComplete;
        gameState.interactionPoints = saveData.gameProgress.interactionPoints;
        gameState.playTimeSeconds = saveData.metadata.playTime;
        gameState.gameStartTime = new Date();

        // Restore tablet state
        if (saveData.gameProgress.tabletState) {
            gameState.tabletState.discovered = saveData.gameProgress.tabletState.discovered || false;
            gameState.tabletState.unlocked = saveData.gameProgress.tabletState.unlocked || false;
            gameState.tabletState.noteRead = saveData.gameProgress.tabletState.noteRead || false;
            gameState.tabletState.questionsAnswered = saveData.gameProgress.tabletState.questionsAnswered || 0;
            gameState.tabletState.correctAnswers = saveData.gameProgress.tabletState.correctAnswers || 0;
        }

        // Note: Evidence sync happens in syncEvidenceState() after initializeGame()
        // because initializeGame() reloads fresh evidence objects from chapter content
        addMessage(`💾 Game loaded from slot ${slotNumber + 1}!`, 'system-message');
        addMessage(`⏱️ Total playtime: ${formatPlayTime(gameState.playTimeSeconds)}`, 'system-message');

        // Check if we should trigger ending
        if (gameState.discoveredEvidence.size === 5 && gameState.examinedEvidence.size === 5 && !gameState.endingTriggered) {
            setTimeout(() => triggerChapterEnding(), 2000);
        }

        return true;
    } catch (error) {
        console.error('Load failed:', error);
        addMessage('⚠️ Failed to load game. Save file may be corrupted.', 'error-message');
        return false;
    }
}

/**
 * Delete a save slot
 * @param {number} slotNumber - Slot number to delete
 */
export function deleteSave(slotNumber) {
    if (confirm(`Are you sure you want to delete save slot ${slotNumber + 1}?`)) {
        const saveKey = `vg_save_${slotNumber}`;
        localStorage.removeItem(saveKey);
        showSaveMenu(); // Refresh the save menu
        addMessage(`🗑️ Save slot ${slotNumber + 1} deleted.`, 'system-message');
    }
}

/**
 * Export a save file
 * @param {number} slotNumber - Slot number to export
 */
export function exportSave(slotNumber) {
    try {
        const saveKey = `vg_save_${slotNumber}`;
        const saveData = localStorage.getItem(saveKey);

        if (!saveData) {
            alert('No save data found in this slot.');
            return;
        }

        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vanishing_glaciers_save_${slotNumber + 1}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addMessage(`📥 Save file exported successfully!`, 'system-message');
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export save file.');
    }
}

/**
 * Import a save file
 */
export function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const saveData = JSON.parse(event.target.result);

                // Validate save data
                if (!saveData.metadata || !saveData.gameProgress) {
                    throw new Error('Invalid save file format');
                }

                // Find first empty slot or ask user
                let targetSlot = 0;
                for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
                    if (!localStorage.getItem(`vg_save_${i}`)) {
                        targetSlot = i;
                        break;
                    }
                }

                localStorage.setItem(`vg_save_${targetSlot}`, JSON.stringify(saveData));
                addMessage(`📤 Save imported to slot ${targetSlot + 1}!`, 'system-message');
                showLoadMenu(); // Refresh the load menu
            } catch (error) {
                console.error('Import failed:', error);
                alert('Failed to import save file. File may be corrupted or invalid.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

/**
 * Get all save slots
 * @returns {Array} Array of save slot objects
 */
export function getSaveSlots() {
    const slots = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
        const saveKey = `vg_save_${i}`;
        const saveData = localStorage.getItem(saveKey);

        if (saveData) {
            try {
                const data = JSON.parse(saveData);
                slots.push({
                    slotNumber: i,
                    data: data,
                    exists: true
                });
            } catch (error) {
                slots.push({ slotNumber: i, exists: false });
            }
        } else {
            slots.push({ slotNumber: i, exists: false });
        }
    }

    // Also check auto-save
    const autoSaveData = localStorage.getItem('vg_save_-1');
    if (autoSaveData) {
        try {
            const data = JSON.parse(autoSaveData);
            slots.unshift({
                slotNumber: -1,
                data: data,
                exists: true
            });
        } catch (error) {
            // Auto-save corrupted, ignore
        }
    }

    return slots;
}

/**
 * Format play time in human-readable format
 * @param {number} seconds - Play time in seconds
 * @returns {string} Formatted play time
 */
export function formatPlayTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Format timestamp in human-readable format
 * @param {string} isoString - ISO timestamp string
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

/**
 * Start auto-save timer
 */
export function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }

    if (gameSettings.autoSaveEnabled) {
        autoSaveTimer = setInterval(autoSave, gameSettings.autoSaveInterval);
    }
}

/**
 * Stop auto-save timer
 */
export function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

// ====================================
// SAVE/LOAD UI FUNCTIONS
// ====================================

/**
 * Show save menu modal
 */
export function showSaveMenu() {
    const modal = document.getElementById('saveModal');
    const title = document.getElementById('saveModalTitle');
    const content = document.getElementById('saveModalContent');

    title.textContent = '💾 Save Game';

    let html = '<p style="color: #a8c5da; margin-bottom: 20px;">Choose a save slot or create a new save:</p>';

    const slots = getSaveSlots();

    slots.forEach(slot => {
        if (slot.slotNumber === -1) return; // Skip auto-save in manual save menu

        if (slot.exists) {
            const progress = Math.round((slot.data.statistics.evidenceFound / 5) * 100);
            html += `
                <div class="save-slot">
                    <div class="save-slot-header">
                        <div class="save-slot-name">Slot ${slot.slotNumber + 1}: ${slot.data.metadata.slotName}</div>
                    </div>
                    <div class="save-slot-info">📅 ${formatTimestamp(slot.data.metadata.timestamp)}</div>
                    <div class="save-slot-info">⏱️ Playtime: ${formatPlayTime(slot.data.metadata.playTime)}</div>
                    <div class="save-slot-info">📊 Progress: ${progress}% (${slot.data.statistics.evidenceFound}/5 evidence)</div>
                    <div class="save-slot-buttons">
                        <button class="save-slot-button" onclick="saveToSlot(${slot.slotNumber})">💾 Overwrite</button>
                        <button class="save-slot-button danger" onclick="deleteSave(${slot.slotNumber})">🗑️ Delete</button>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="save-slot empty-slot">
                    <div class="save-slot-header">
                        <div class="save-slot-name">Slot ${slot.slotNumber + 1}: Empty</div>
                    </div>
                    <div class="save-slot-buttons">
                        <button class="save-slot-button" onclick="saveToSlot(${slot.slotNumber})">💾 Save Here</button>
                    </div>
                </div>
            `;
        }
    });

    content.innerHTML = html;
    modal.classList.add('active');
}

/**
 * Show load menu modal
 */
export function showLoadMenu() {
    const modal = document.getElementById('saveModal');
    const title = document.getElementById('saveModalTitle');
    const content = document.getElementById('saveModalContent');

    title.textContent = '📂 Load Game';

    let html = '<p style="color: #a8c5da; margin-bottom: 20px;">Choose a save file to load:</p>';

    const slots = getSaveSlots();
    const hasSaves = slots.some(s => s.exists);

    if (!hasSaves) {
        html += '<p style="color: #ffab40; text-align: center;">No saved games found.</p>';
    } else {
        slots.forEach(slot => {
            if (!slot.exists) return;

            const progress = Math.round((slot.data.statistics.evidenceFound / 5) * 100);
            const slotLabel = slot.slotNumber === -1 ? 'Auto Save' : `Slot ${slot.slotNumber + 1}`;

            html += `
                <div class="save-slot">
                    <div class="save-slot-header">
                        <div class="save-slot-name">${slotLabel}: ${slot.data.metadata.slotName}</div>
                    </div>
                    <div class="save-slot-info">📅 ${formatTimestamp(slot.data.metadata.timestamp)}</div>
                    <div class="save-slot-info">⏱️ Playtime: ${formatPlayTime(slot.data.metadata.playTime)}</div>
                    <div class="save-slot-info">📊 Progress: ${progress}% (${slot.data.statistics.evidenceFound}/5 evidence)</div>
                    <div class="save-slot-buttons">
                        <button class="save-slot-button" onclick="loadFromSlot(${slot.slotNumber})">📂 Load</button>
                        <button class="save-slot-button" onclick="exportSave(${slot.slotNumber})">📥 Export</button>
                        ${slot.slotNumber !== -1 ? `<button class="save-slot-button danger" onclick="deleteSave(${slot.slotNumber})">🗑️ Delete</button>` : ''}
                    </div>
                </div>
            `;
        });
    }

    html += `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #2a3f5f;">
            <button class="save-slot-button" onclick="importSave()" style="width: 100%; padding: 12px;">
                📤 Import Save File
            </button>
        </div>
    `;

    content.innerHTML = html;
    modal.classList.add('active');
}

/**
 * Save to a specific slot (called from UI)
 * @param {number} slotNumber - Slot number to save to
 */
export function saveToSlot(slotNumber) {
    if (saveGame(slotNumber)) {
        closeSaveModal();
    }
}

/**
 * Load from a specific slot (called from UI)
 * @param {number} slotNumber - Slot number to load from
 */
export function loadFromSlot(slotNumber) {
    closeSaveModal();

    // Hide main menu if showing
    hideMainMenu();

    if (loadGame(slotNumber)) {
        // Initialize the chapter to set up interaction points and evidence
        initializeGame();

        // Sync evidence state after initialization (because initializeGame reloads fresh evidence)
        syncEvidenceState();

        // Show game resumed message and current location
        addMessage("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'system-message', true);
        addMessage("🎮 GAME LOADED", 'system-message');
        addMessage("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", 'system-message', true);
        showLocation();

        startAutoSave();
    }
}

/**
 * Close save modal
 */
export function closeSaveModal() {
    document.getElementById('saveModal').classList.remove('active');
}

// ====================================
// SETTINGS MANAGEMENT
// ====================================

/**
 * Load saved settings from localStorage
 */
export function loadSettings() {
    const savedSettings = localStorage.getItem('vg_settings');
    if (savedSettings) {
        Object.assign(gameSettings, JSON.parse(savedSettings));
    }
}

/**
 * Save settings to localStorage
 */
export function saveSettings() {
    localStorage.setItem('vg_settings', JSON.stringify(gameSettings));
}

// Make functions globally available for onclick handlers in HTML
// This is necessary because the HTML buttons use onclick="functionName()"
if (typeof window !== 'undefined') {
    window.saveToSlot = saveToSlot;
    window.loadFromSlot = loadFromSlot;
    window.deleteSave = deleteSave;
    window.exportSave = exportSave;
    window.importSave = importSave;
}
