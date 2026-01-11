/**
 * Game State Module
 *
 * Centralized state management for The Vanishing Glaciers.
 * This module maintains all game state and is imported by other modules.
 *
 * No dependencies - this is the foundation module.
 */

export const gameState = {
    // Evidence tracking
    discoveredEvidence: new Set(),
    examinedEvidence: new Set(),
    learnedConcepts: new Set(),

    // NPC interactions
    talkedToMaya: false,
    topicsDiscussed: new Set(),

    // Game progress
    gameStarted: false,
    gameStartTime: null,
    playTimeSeconds: 0,
    commandsEntered: 0,
    hintsUsed: 0,
    endingTriggered: false,
    chapterComplete: false,

    // Chapter-specific data (loaded dynamically by chapter modules)
    interactionPoints: {},
    evidence: {},

    // Tablet security system
    tabletState: {
        discovered: false,
        unlockAttempted: false,
        questionsAnswered: 0,
        correctAnswers: 0,
        currentQuestionIndex: 0,
        questions: [],
        wrongAttempts: {},
        unlocked: false,
        noteRead: false
    },

    // UI state
    evidencePanelOpen: false,

    // AI mode
    aiMode: false,
    aiEngine: null,
    aiLoading: false,

    // Ending sequence state
    waitingForEnter: false,
    enterCallback: null
};
