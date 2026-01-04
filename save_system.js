// ====================================
// SAVE/LOAD SYSTEM FOR THE VANISHING GLACIERS
// Version 1.0.0
// ====================================

const GAME_VERSION = "1.0.0";
const MAX_SAVE_SLOTS = 5;
const AUTO_SAVE_INTERVAL = 180000; // 3 minutes in milliseconds

// Game settings
const gameSettings = {
    autoSaveEnabled: true,
    autoSaveInterval: AUTO_SAVE_INTERVAL,
    ttsEnabled: true,
    sttEnabled: true,
    hintsEnabled: true
};

let autoSaveTimer = null;

// Additional game state properties for save system
gameState.gameStartTime = null;
gameState.playTimeSeconds = 0;
gameState.commandsEntered = 0;
gameState.hintsUsed = 0;
gameState.endingTriggered = false;
gameState.chapterComplete = false;

// ====================================
// SAVE DATA CREATION AND MANAGEMENT
// ====================================

function createSaveData(slotName = "Auto Save") {
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
            interactionPoints: gameState.interactionPoints
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

function saveGame(slotNumber = 0, slotName = null) {
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

function autoSave() {
    if (gameSettings.autoSaveEnabled && gameState.gameStarted && !gameState.chapterComplete) {
        saveGame(-1, 'Auto Save');
    }
}

function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.classList.add('saving');
        setTimeout(() => {
            indicator.classList.remove('saving');
        }, 2000);
    }
}

function loadGame(slotNumber) {
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

        // Update UI
        updateEvidenceDisplay();
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

function deleteSave(slotNumber) {
    if (confirm(`Are you sure you want to delete save slot ${slotNumber + 1}?`)) {
        const saveKey = `vg_save_${slotNumber}`;
        localStorage.removeItem(saveKey);
        showSaveMenu(); // Refresh the save menu
        addMessage(`🗑️ Save slot ${slotNumber + 1} deleted.`, 'system-message');
    }
}

function exportSave(slotNumber) {
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

function importSave() {
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

function getSaveSlots() {
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

function formatPlayTime(seconds) {
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

function formatTimestamp(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

function startAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
    
    if (gameSettings.autoSaveEnabled) {
        autoSaveTimer = setInterval(autoSave, gameSettings.autoSaveInterval);
    }
}

function stopAutoSave() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
        autoSaveTimer = null;
    }
}

// ====================================
// SAVE/LOAD UI FUNCTIONS
// ====================================

function showSaveMenu() {
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

function showLoadMenu() {
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

function saveToSlot(slotNumber) {
    if (saveGame(slotNumber)) {
        closeSaveModal();
    }
}

function loadFromSlot(slotNumber) {
    closeSaveModal();
    if (loadGame(slotNumber)) {
        startAutoSave();
    }
}

function closeSaveModal() {
    document.getElementById('saveModal').classList.remove('active');
}

// Load saved settings on initialization
function loadSettings() {
    const savedSettings = localStorage.getItem('vg_settings');
    if (savedSettings) {
        Object.assign(gameSettings, JSON.parse(savedSettings));
    }
}

// Save settings when changed
function saveSettings() {
    localStorage.setItem('vg_settings', JSON.stringify(gameSettings));
}
