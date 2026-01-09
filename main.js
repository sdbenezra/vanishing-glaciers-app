/**
 * Main Bootstrap File
 * The Vanishing Glaciers - Chapter 1
 *
 * This file initializes the game and wires all modules together.
 * It's the entry point for the application.
 */

// Import core modules
import { gameState } from './js/shared/game-state.js';
import {
    initializeUIListeners,
    setToggleAIModeFunction,
    toggleHelp,
    toggleEvidence,
    showAIConfirmation,
    closeAIConfirmation,
    confirmAIMode
} from './js/core/ui-manager.js';
import {
    initSpeechRecognition,
    toggleMute,
    toggleVoiceInput
} from './js/core/speech-manager.js';
import {
    loadSettings,
    startAutoSave,
    showSaveMenu,
    showLoadMenu,
    closeSaveModal,
    setSaveManagerGameFunctions
} from './js/core/save-manager.js';
import {
    showMainMenu,
    setGameFunctions,
    continueGame,
    startNewGame,
    returnToMainMenu
} from './js/core/menu-manager.js';
import { toggleAIMode } from './js/core/ai-integration.js';
import { setGameCommandFunctions } from './js/core/ai-integration.js';
import {
    setChapterFunctions,
    initializeCommandInput,
    submitCommand,
    showHelp,
    showInventory,
    showProgress
} from './js/core/game-engine.js';

// Import Chapter 1 modules
import {
    initializeChapter,
    showIntro,
    clearGameOutput,
    showLocation,
    getMayaGreeting,
    getMayaResponse,
    showEvidenceToMaya
} from './js/chapters/chapter1/chapter1-logic.js';
import { checkChapterCompletion } from './js/chapters/chapter1/chapter1-ending.js';

/**
 * Initialize the game on page load
 */
window.onload = function() {
    console.log('🎮 Initializing The Vanishing Glaciers...');

    // Step 1: Load user settings from localStorage
    loadSettings();
    console.log('✓ Settings loaded');

    // Step 2: Initialize speech recognition (if available)
    initSpeechRecognition();
    console.log('✓ Speech recognition initialized');

    // Step 3: Pre-load voices for speech synthesis
    if ('speechSynthesis' in window) {
        // Load voices
        speechSynthesis.getVoices();

        // Some browsers need this event
        speechSynthesis.addEventListener('voiceschanged', () => {
            const voices = speechSynthesis.getVoices();
            console.log('Voices loaded:', voices.length);

            // Check for Lekha (Dr. Patel's voice - offline Hindi)
            const lekhaVoice = voices.find(v =>
                v.name.includes('Lekha') && v.lang === 'hi-IN'
            );
            if (lekhaVoice) {
                console.log('✓ Lekha voice found (Dr. Patel):', lekhaVoice.name, '-', lekhaVoice.lang);
            } else {
                console.log('⚠️ Lekha voice not found, will use fallback for Dr. Patel');
            }

            // Check for Martha (Narrator's voice - offline UK English)
            const marthaVoice = voices.find(v =>
                v.name.includes('Martha') && v.lang === 'en-GB'
            );
            if (marthaVoice) {
                console.log('✓ Martha voice found (Narrator):', marthaVoice.name, '-', marthaVoice.lang);
            } else {
                console.log('⚠️ Martha voice not found, will use fallback for narrator');
            }
        });
    }

    // Step 4: Connect menu manager to game functions
    setGameFunctions({
        initializeGame: initializeChapter,
        showIntro: showIntro,
        showLocation: showLocation,
        clearGameOutput: clearGameOutput
    });
    console.log('✓ Menu manager connected to game functions');

    // Step 5: Connect game engine to Chapter 1 functions
    setChapterFunctions({
        showLocation: showLocation,
        getMayaGreeting: getMayaGreeting,
        getMayaResponse: getMayaResponse,
        showEvidenceToMaya: showEvidenceToMaya,
        checkChapterCompletion: checkChapterCompletion
    });
    console.log('✓ Game engine connected to Chapter 1');

    // Step 5.5: Connect save manager to game functions
    setSaveManagerGameFunctions({
        initializeGame: initializeChapter,
        showLocation: showLocation
    });
    console.log('✓ Save manager connected to game functions');

    // Step 6: Connect AI integration to game engine commands
    setGameCommandFunctions({
        showLocation: showLocation,
        handleExamine: null, // AI will call game engine's processCommand instead
        handleTalk: null,    // AI will call game engine's processCommand instead
        showInventory: showInventory,
        showProgress: showProgress,
        showHelp: showHelp
    });
    console.log('✓ AI integration connected to game engine');

    // Step 7: Connect UI manager to AI integration
    setToggleAIModeFunction(toggleAIMode);
    console.log('✓ UI manager connected to AI integration');

    // Step 8: Initialize UI event listeners
    initializeUIListeners();
    console.log('✓ UI event listeners initialized');

    // Step 9: Initialize command input handler
    initializeCommandInput();
    console.log('✓ Command input initialized');

    // Step 10: Show main menu on startup
    showMainMenu();
    console.log('✓ Main menu displayed');

    // Step 11: Start auto-save if game already in progress
    if (gameState.gameStarted) {
        gameState.gameStartTime = new Date();
        startAutoSave();
        console.log('✓ Auto-save started (game in progress)');
    }

    console.log('🎮 The Vanishing Glaciers initialized successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
};

// ==================================================================
// GLOBAL EXPORTS FOR HTML ONCLICK HANDLERS
// ==================================================================
// These functions are made globally available so HTML onclick attributes can call them.
// This is necessary because ES6 modules have their own scope.

// Menu functions
window.continueGame = continueGame;
window.startNewGame = startNewGame;
window.returnToMainMenu = returnToMainMenu;

// Save/Load functions
window.showSaveMenu = showSaveMenu;
window.showLoadMenu = showLoadMenu;
window.closeSaveModal = closeSaveModal;

// Speech functions
window.toggleMute = toggleMute;
window.toggleVoiceInput = toggleVoiceInput;

// UI functions
window.toggleHelp = toggleHelp;
window.toggleEvidence = toggleEvidence;
window.showAIConfirmation = showAIConfirmation;
window.closeAIConfirmation = closeAIConfirmation;
window.confirmAIMode = confirmAIMode;

// Game engine functions
window.submitCommand = submitCommand;
