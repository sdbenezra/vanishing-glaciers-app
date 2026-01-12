/**
 * Chapter 1 Ending Module
 *
 * Handles the ending sequence for Chapter 1:
 * - Chapter completion check
 * - Ending dialogue sequence
 * - Chapter 2 teaser
 * - Email signup and replay functionality
 *
 * Dependencies: game-state.js, ui-manager.js, save-manager.js, menu-manager.js
 */

import { gameState } from '../../shared/game-state.js';
import { addMessage } from '../../core/ui-manager.js';
import { autoSave, saveGame, formatPlayTime } from '../../core/save-manager.js';
import { updateContinueButton, returnToMainMenuFromEnding } from '../../core/menu-manager.js';
import { initializeChapter, showIntro, clearGameOutput } from './chapter1-logic.js';
import { updateEvidenceDisplay } from '../../core/ui-manager.js';

// ====================================
// CHAPTER COMPLETION CHECK
// ====================================

/**
 * Check if chapter completion conditions are met
 */
export function checkChapterCompletion() {
    const allEvidenceFound = gameState.discoveredEvidence.size === 5;
    const allEvidenceExamined = gameState.examinedEvidence.size === 5;

    if (allEvidenceFound && allEvidenceExamined && !gameState.endingTriggered) {
        // Trigger ending after a short delay
        setTimeout(() => {
            triggerChapterEnding();
        }, 3000);
    }
}

// ====================================
// ENDING SEQUENCE
// ====================================

/**
 * Trigger the chapter ending sequence
 */
function triggerChapterEnding() {
    if (gameState.endingTriggered) return;

    gameState.endingTriggered = true;

    // Save before ending sequence
    autoSave();

    addMessage('═══════════════════════════════════════════════', 'system-message');
    addMessage('           INVESTIGATION COMPLETE', 'system-message');
    addMessage('═══════════════════════════════════════════════', 'system-message');

    setTimeout(() => {
        showEndingDialogue1();
    }, 2000);
}

/**
 * Show first ending dialogue
 */
function showEndingDialogue1() {
    const narration = `Dr. Patel walks over to your workstation, reviewing the evidence you've gathered.`;
    addMessage(narration, 'system-message');

    setTimeout(() => {
        const maya1 = `🗣️  Dr. Maya Patel: "I think I understand what happened. Look at the pattern here..."`;
        addMessage(maya1, 'dialogue-message');
    }, 5000);

    setTimeout(() => {
        const narration2 = `She gestures to the evidence laid out before you.`;
        addMessage(narration2, 'system-message');
    }, 10000);

    setTimeout(() => {
        const maya2 = `🗣️  Dr. Maya Patel: "Sarah found something unexpected in the temperature data, a two point three °C increase in ice that should be stable for centuries. That's not a minor anomaly.
        But she's a careful scientist. She recalibrated the sensors repeatedly, cross-checked with satellite thermal imaging, even examined ice cores. Every single test confirmed the same thing: the warming is real.
        So she followed proper scientific protocol. Before making any public claims about such dramatic findings, she went to sector seven B to collect physical evidence - actual ice samples, direct thermal measurements.
        She's not in danger. She's being thorough. That's what good scientists do."`;
        addMessage(maya2, 'dialogue-message');
    }, 15000);

    setTimeout(() => {
        const narration3 = `You nod, the pieces falling into place.`;
        addMessage(narration3, 'system-message');
    }, 60000);

    setTimeout(() => {
        addMessage('\n[Hit ENTER or press SEND to continue..]', 'system-message');
        waitForEnter(() => showEndingDialogue2());
    }, 65000);
}

/**
 * Show second ending dialogue
 */
function showEndingDialogue2() {
    addMessage('═══════════════════════════════════════════════', 'system-message');

    setTimeout(() => {
        const maya1 = `🗣️  Dr. Maya Patel: "Actually, there's something else I should show you..."`;
        addMessage(maya1, 'dialogue-message');
    }, 1000);

    setTimeout(() => {
        const narration = `She pulls up a system log on her tablet.`;
        addMessage(narration, 'system-message');
    }, 5000);

    setTimeout(() => {
        const maya2 = `🗣️  Dr. Maya Patel: "Sarah activated 'Winter Protocol' just before midnight last night. That's our secure emergency backup system. We only use it when data is too critical to risk losing, natural disasters, equipment failures, that sort of thing.
        She backed up all her research findings to our off-site servers before leaving. Whatever she found, she made absolutely certain it wouldn't be lost."`;
        addMessage(maya2, 'dialogue-message');
    }, 8000);

    setTimeout(() => {
        const narration2 = `A slight frown crosses Maya's face.`;
        addMessage(narration2, 'system-message');
    }, 35000);

    setTimeout(() => {
        addMessage('\n[Hit ENTER or press SEND to continue..]', 'system-message');
        waitForEnter(() => showEndingDialogue3());
    }, 40000);
}

/**
 * Show third ending dialogue
 */
function showEndingDialogue3() {
    addMessage('═══════════════════════════════════════════════', 'system-message');

    setTimeout(() => {
        const maya1 = `🗣️  Dr. Maya Patel: "There's just one thing that seems... odd.
        I found this in Sarah's personal locker. It's encrypted - which is unusual for routine field work communication."`;
        addMessage(maya1, 'dialogue-message');
    }, 1000);

    setTimeout(() => {
        const narration = `She shows you a piece of paper.`;
        addMessage(narration, 'system-message');
    }, 11000);

    setTimeout(() => {
        const encryptedNote = `╔═══════════════════════════════════════════════╗
║  ENCRYPTED NOTE - PARTIAL DECRYPTION          ║
╠═══════════════════════════════════════════════╣
║  To: K [Kristin Hansen]                       ║
║                                               ║
║  "...they're watching... can't trust usual    ║
║  channels... 7-B critical... backup           ║
║  everything... if anything happens..."        ║
║                                               ║
║  - S                                          ║
║                                               ║
║  [Remainder encrypted - AES-256]              ║
╚═══════════════════════════════════════════════╝`;
        addMessage(encryptedNote, 'system-message');
    }, 15000);

    setTimeout(() => {
        const maya3 = `🗣️  Dr. Maya Patel: "Who's 'they'? And why encrypt a message to her grad student about a routine verification trip?
        Maybe I'm reading too much into it. Scientists can be paranoid about data security..."`;
        addMessage(maya3, 'dialogue-message');
    }, 30000);

    setTimeout(() => {
        const narration = `But she doesn't sound convinced.`;
        addMessage(narration, 'system-message');
    }, 45000);

    setTimeout(() => {
        addMessage('\n[Hit ENTER or press SEND to continue..]', 'system-message');
        waitForEnter(() => showChapterSummary());
    }, 50000);
}

/**
 * Show chapter completion summary
 */
function showChapterSummary() {
    gameState.chapterComplete = true;

    // Calculate final stats
    const playTime = Math.floor((new Date() - gameState.gameStartTime) / 1000) + gameState.playTimeSeconds;

    const summary = `═══════════════════════════════════════════════
         CHAPTER 1: THE DISAPPEARANCE
                  COMPLETE
═══════════════════════════════════════════════

MYSTERY SOLVED:
Dr. Sarah Chen discovered unprecedented warming in deep glacier layers.
Following proper scientific methodology, she went to sector 7 B to
collect physical evidence before making any public announcements.

EVIDENCE COLLECTED:
✓ Temperature Monitoring Data
✓ Sensor Calibration Log
✓ Dr. Chen's Field Note
✓ Ice Core Sample #47
✓ Satellite Thermal Image

CLIMATE SCIENCE CONCEPTS LEARNED:
✓ Glacier Temperature Monitoring
✓ Scientific Data Verification
✓ Glacier Melting Consequences
✓ Ice Cores as Climate Archives
✓ Remote Sensing & Thermal Imaging

YOUR INVESTIGATION:
⏱️ Time Played: ${formatPlayTime(playTime)}
📊 Evidence Found: ${gameState.discoveredEvidence.size} of 5 (100%)
🔬 Evidence Examined: ${gameState.examinedEvidence.size} of 5 (100%)
💬 Conversation Topics: ${gameState.topicsDiscussed.size}
🎯 Investigation Rating: THOROUGH

Dr. Chen's research will help scientists understand glacier
destabilization and climate change impacts.

But questions remain: Who was watching? Why the encryption?
What else did Sarah discover?

═══════════════════════════════════════════════`;

    addMessage(summary, 'system-message');

    // Auto-save completion
    saveGame(-1, 'Chapter 1 Complete');

    setTimeout(() => {
        addMessage('\n[Hit ENTER or press SEND to see Chapter 2 preview]', 'system-message');
        waitForEnter(() => showChapter2Teaser());
    }, 60000);
}

// ====================================
// CHAPTER 2 TEASER
// ====================================

/**
 * Show Chapter 2 teaser modal
 */
function showChapter2Teaser() {
    document.getElementById('chapterCompleteModal').classList.add('active');

    const content = document.getElementById('chapterCompleteContent');
    content.innerHTML = `
        <div class="chapter-complete">
            <h1>❄️ CHAPTER 1 COMPLETE ❄️</h1>
            <h2>Coming Soon: Chapter 2 - "Hidden Depths"</h2>

            <div style="max-width: 600px; margin: 0 auto; text-align: left; color: #a8c5da; line-height: 1.8;">
                <p style="margin: 20px 0;">
                    The mystery deepens...
                </p>

                <p style="margin: 20px 0;">
                    Sarah's encrypted note raises new questions. Who was threatening her research?
                    What corporate interests might be involved? And what is Kristin Hansen hiding?
                </p>

                <h3 style="color: #4dd0e1; margin: 30px 0 15px 0;">Chapter 2 will take you deeper into:</h3>
                <ul style="margin-left: 30px;">
                    <li>Sarah's personal quarters and communications</li>
                    <li>Corporate connections to climate research</li>
                    <li>New characters with hidden motives</li>
                    <li>The true scope of the discovery</li>
                </ul>

                <div style="background: #2a3f5f; padding: 20px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #4dd0e1;">
                    <h3 style="color: #4dd0e1; margin-bottom: 10px;">CHAPTER 2: "HIDDEN DEPTHS"</h3>
                    <p style="margin: 5px 0;">📅 Estimated Release: <span style="color: #ffab40;">TBD</span></p>
                    <p style="margin: 5px 0;">⏱️ Gameplay: 45-60 minutes</p>
                    <p style="margin: 5px 0;">🎮 Your choices in Chapter 1 will carry forward</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <p style="margin-bottom: 15px; font-size: 18px; color: #4dd0e1;">
                        Want to be notified when Chapter 2 launches?
                    </p>
                    <button class="chapter-button" onclick="showEmailSignup()">
                        📧 Sign Up for Updates
                    </button>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #4dd0e1; text-align: center;">
                    <p style="color: #81c784; margin-bottom: 20px;">
                        ✅ Your Chapter 1 save file is ready for Chapter 2!<br>
                        Progress has been automatically saved.
                    </p>

                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="chapter-button" onclick="returnToMainMenuFromEnding()">
                            🏠 Return to Main Menu
                        </button>
                        <button class="chapter-button secondary" onclick="playAgain()">
                            🔄 Play Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Show email signup form
 */
function showEmailSignup() {
    const content = document.getElementById('chapterCompleteContent');
    content.innerHTML = `
        <div class="chapter-complete">
            <h1>📧 Stay Updated</h1>
            <h2>Get notified when Chapter 2 launches</h2>

            <div style="max-width: 500px; margin: 30px auto; padding: 30px; background: #2a3f5f; border-radius: 10px;">
                <p style="color: #a8c5da; margin-bottom: 20px; text-align: center;">
                    Enter your email to receive updates about Chapter 2 and future episodes of The Vanishing Glaciers.
                </p>

                <input type="email"
                       id="emailInput"
                       placeholder="This option deactivated - your.email@example.com"
                       style="width: 100%; padding: 15px; background: #1a2332; border: 2px solid #4dd0e1; color: #4dd0e1; font-size: 16px; border-radius: 5px; margin-bottom: 15px;">

                <button class="chapter-button" onclick="submitEmail()" style="width: 100%; margin: 10px 0;">
                    ✅ Sign Up
                </button>

                <button class="chapter-button secondary" onclick="showChapter2Teaser()" style="width: 100%; margin: 10px 0;">
                    ← Back
                </button>

                <p style="color: #a8c5da; font-size: 12px; text-align: center; margin-top: 20px;">
                    We respect your privacy. Your email will only be used for game updates.
                </p>
            </div>
        </div>
    `;
}

/**
 * Submit email signup
 */
function submitEmail() {
    const email = document.getElementById('emailInput').value;

    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
    }

    // Placeholder for email signup
    // In production, this would send to a mailing list service
    console.log('Email signup:', email);
    localStorage.setItem('vg_email_signup', email);

    const content = document.getElementById('chapterCompleteContent');
    content.innerHTML = `
        <div class="chapter-complete">
            <h1>✅ Thank You!</h1>
            <h2>You're all set</h2>

            <div style="max-width: 500px; margin: 30px auto; padding: 30px; background: #2a3f5f; border-radius: 10px; text-align: center;">
                <p style="color: #81c784; font-size: 18px; margin-bottom: 20px;">
                    📧 <h2>Email-Not Taking Emails Yet, Stay Tuned>
                </p>

                <p style="color: #a8c5da; margin-bottom: 30px;">
                    We'll send you an email when Chapter 2: "Hidden Depths" is ready to play.
                    In the meantime, feel free to replay Chapter 1 or explore different investigative approaches!
                </p>

                <button class="chapter-button" onclick="returnToMainMenuFromEnding()" style="width: 100%; margin: 10px 0;">
                    🏠 Return to Main Menu
                </button>

                <button class="chapter-button secondary" onclick="playAgain()" style="width: 100%; margin: 10px 0;">
                    🔄 Play Chapter 1 Again
                </button>
            </div>
        </div>
    `;
}

/**
 * Play again - restart Chapter 1
 */
function playAgain() {
    // Close chapter complete modal
    document.getElementById('chapterCompleteModal').classList.remove('active');

    // Clear game output
    clearGameOutput();

    // Reset game state
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

    // Keep game container visible
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.classList.remove('hidden');
    }

    // Hide main menu if visible
    const mainMenu = document.getElementById('mainMenu');
    if (mainMenu) {
        mainMenu.classList.add('hidden');
    }

    // Initialize and start fresh game
    initializeChapter();
    updateEvidenceDisplay();

    // Start auto-save dynamically
    import('../../core/save-manager.js').then(({ startAutoSave }) => {
        startAutoSave();
    });
}

// ====================================
// WAIT FOR ENTER HELPER
// ====================================

/**
 * Wait for Enter key press before continuing
 * @param {Function} callback - Function to call when Enter is pressed
 */
function waitForEnter(callback) {
    gameState.waitingForEnter = true;
    gameState.enterCallback = callback;

    // Visual indicator that we're waiting for Enter
    const input = document.getElementById('commandInput');
    if (input) {
        input.classList.add('waiting-for-enter');
        input.placeholder = "Hit ENTER or press SEND to continue...";
        input.value = ''; // Clear any existing text
    }
}

// Make functions globally available for onclick handlers in HTML
if (typeof window !== 'undefined') {
    window.showEmailSignup = showEmailSignup;
    window.submitEmail = submitEmail;
    window.showChapter2Teaser = showChapter2Teaser;
    window.playAgain = playAgain;
    window.returnToMainMenuFromEnding = returnToMainMenuFromEnding;
}
