/**
 * Tablet Security System Module
 *
 * Implements the encrypted tablet security system that gates access to Dr. Chen's note.
 * Players must examine 4 pieces of evidence and answer security questions.
 *
 * Dependencies: chapter1-content.js, game-state.js, ui-manager.js
 */

import { SECURITY_QUESTIONS } from './chapter1-content.js';
import { gameState } from '../../shared/game-state.js';
import { addMessage, updateEvidenceDisplay, openEvidencePanel } from '../../core/ui-manager.js';

/**
 * Examine the tablet - shows lock screen
 */
export function examineTablet() {
    gameState.tabletState.discovered = true;

    if (gameState.tabletState.unlocked) {
        addMessage(`📱 DR. CHEN'S FIELD TABLET - UNLOCKED

🔓 Authentication successful.

Type "read tablet" to view notes.`);
        return;
    }

    if (gameState.tabletState.unlockAttempted && gameState.tabletState.questionsAnswered > 0) {
        showTabletProgress();
        return;
    }

    addMessage(`📱 DR. CHEN'S FIELD TABLET - LOCKED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 POLARIS BASE SECURITY PROTOCOL

Field Data Access - Authentication Required

Dr. Sarah Chen's Research Notes
Last Modified: May 3, 23:52

[LOCKED - Answer security questions]

Questions Answered: 0 / 4

Type "unlock tablet" to begin authentication.
💡 Examine evidence around the lab first.`);
}

/**
 * Show tablet progress
 */
function showTabletProgress() {
    const answered = gameState.tabletState.questionsAnswered;
    const correct = gameState.tabletState.correctAnswers;
    const progressBar = '█'.repeat(answered) + '░'.repeat(4 - answered);

    addMessage(`📱 AUTHENTICATION IN PROGRESS

Progress: [${progressBar}] ${answered}/4
Correct: ${correct}/4

Type "unlock tablet" to continue.`);
}

/**
 * Start tablet unlock process
 */
export function startTabletUnlock() {
    const required = ['temperature_data', 'calibration_log', 'ice_core_sample', 'satellite_thermal_image'];
    const examined = required.filter(id => gameState.examinedEvidence.has(id));

    if (examined.length < 4) {
        const missing = required.filter(id => !gameState.examinedEvidence.has(id))
            .map(id => gameState.evidence[id].name).join(', ');
        addMessage(`📱 AUTHENTICATION UNAVAILABLE

Need to examine more evidence: ${missing}

💡 Examine evidence first, then return.`, 'warning-message');
        return;
    }

    if (!gameState.tabletState.unlockAttempted) {
        gameState.tabletState.unlockAttempted = true;
        gameState.tabletState.questions = [
            SECURITY_QUESTIONS.temperature,
            SECURITY_QUESTIONS.calibration,
            SECURITY_QUESTIONS.ice_core_age,
            SECURITY_QUESTIONS.satellite_percentage
        ];
        gameState.tabletState.currentQuestionIndex = 0;
        gameState.tabletState.wrongAttempts = {};
    }

    if (gameState.tabletState.unlocked) {
        addMessage('✓ Tablet already unlocked. Type "read tablet" to view notes.', 'success-message');
        return;
    }

    if (gameState.tabletState.questionsAnswered >= 4) {
        checkTabletUnlockSuccess();
        return;
    }

    showCurrentQuestion();
}

/**
 * Show current security question
 */
function showCurrentQuestion() {
    const idx = gameState.tabletState.currentQuestionIndex;
    const q = gameState.tabletState.questions[idx];
    if (!q) return checkTabletUnlockSuccess();

    const answered = gameState.tabletState.questionsAnswered;
    const progressBar = '█'.repeat(answered) + '░'.repeat(4 - answered);
    const questionText = q.question.replace('{num}', answered + 1);

    addMessage(`┌────────────────────────────────────────┐
│ 🔒 SECURITY - DR. SARAH CHEN          │
├────────────────────────────────────────┤
│ Progress: [${progressBar}] ${answered}/4            │
└────────────────────────────────────────┘

${questionText}

Type "unlock tablet [answer]" to respond.
Type "hint" for help.`);
}

/**
 * Handle tablet answer submission
 * @param {string} answer - User's answer
 */
export function handleTabletAnswer(answer) {
    if (!gameState.tabletState.unlockAttempted) {
        addMessage('Type "unlock tablet" first to start.', 'warning-message');
        return;
    }

    const idx = gameState.tabletState.currentQuestionIndex;
    const q = gameState.tabletState.questions[idx];
    if (!q) return checkTabletUnlockSuccess();

    const userAns = parseFloat(answer.match(/(\d+\.?\d*)/)?.[1]);
    const isCorrect = userAns !== null && Math.abs(userAns - q.answer) <= q.tolerance;

    if (!gameState.tabletState.wrongAttempts[q.id]) {
        gameState.tabletState.wrongAttempts[q.id] = 0;
    }

    if (isCorrect) {
        gameState.tabletState.correctAnswers++;
        gameState.tabletState.questionsAnswered++;
        gameState.tabletState.currentQuestionIndex++;

        const msg = q.correctMsg.replace('{count}', gameState.tabletState.questionsAnswered);
        addMessage(msg, 'success-message');

        if (gameState.tabletState.questionsAnswered >= 4) {
            setTimeout(() => checkTabletUnlockSuccess(), 1000);
        } else {
            setTimeout(() => showCurrentQuestion(), 1500);
        }
    } else {
        gameState.tabletState.wrongAttempts[q.id]++;
        const attempts = gameState.tabletState.wrongAttempts[q.id];

        addMessage(q.incorrectMsg, 'warning-message');

        if (attempts === 2 && q.hint1) {
            setTimeout(() => addMessage(`💡 HINT: ${q.hint1}`, 'system-message'), 500);
        } else if (attempts === 3 && q.hint2) {
            setTimeout(() => addMessage(`💡 STRONGER HINT: ${q.hint2}`, 'system-message'), 500);
        } else if (attempts >= 5) {
            setTimeout(() => addMessage(`Attempted ${attempts} times. Type "skip question" to skip (need 3/4 correct).`, 'system-message'), 500);
        }
    }
}

/**
 * Skip current question (after 5 attempts)
 */
export function skipTabletQuestion() {
    if (!gameState.tabletState.unlockAttempted) return;

    const q = gameState.tabletState.questions[gameState.tabletState.currentQuestionIndex];
    const attempts = gameState.tabletState.wrongAttempts[q?.id] || 0;

    if (attempts < 5) {
        addMessage('Can only skip after 5 attempts. Try "hint" for help.', 'warning-message');
        return;
    }

    addMessage('Question skipped. Need 3/4 correct to unlock.', 'system-message');
    gameState.tabletState.questionsAnswered++;
    gameState.tabletState.currentQuestionIndex++;

    if (gameState.tabletState.questionsAnswered >= 4) {
        setTimeout(() => checkTabletUnlockSuccess(), 1000);
    } else {
        setTimeout(() => showCurrentQuestion(), 1500);
    }
}

/**
 * Show hint for current question
 */
export function showTabletHint() {
    if (!gameState.tabletState.unlockAttempted) return;

    const idx = gameState.tabletState.currentQuestionIndex;
    const q = gameState.tabletState.questions[idx];
    if (!q) return;

    const attempts = gameState.tabletState.wrongAttempts[q.id] || 0;

    if (attempts === 0) {
        addMessage('💡 Try answering first. The answer is in the evidence.', 'system-message');
    } else if (attempts < 2) {
        addMessage(`💡 ${q.hint1}`, 'system-message');
    } else {
        addMessage(`💡 ${q.hint2}`, 'system-message');
    }
}

/**
 * Check if unlock was successful
 */
function checkTabletUnlockSuccess() {
    const correct = gameState.tabletState.correctAnswers;

    if (correct >= 3) {
        gameState.tabletState.unlocked = true;
        gameState.evidence.sarah_note.discovered = true;
        gameState.discoveredEvidence.add('sarah_note');

        addMessage(`┌────────────────────────────────────────┐
│ 🔓 AUTHENTICATION SUCCESSFUL          │
├────────────────────────────────────────┤
│ Progress: [████████] 4/4              │
│ Correct: ${correct}/4                         │
│                                       │
│ Access granted to field notes.        │
│ Type "read tablet" to view.           │
└────────────────────────────────────────┘`, 'success-message');

        updateEvidenceDisplay();
        openEvidencePanel();
    } else {
        addMessage(`┌────────────────────────────────────────┐
│ ❌ AUTHENTICATION FAILED              │
├────────────────────────────────────────┤
│ Correct: ${correct}/4 (Need 3/4)              │
│ Type "unlock tablet" to retry.        │
└────────────────────────────────────────┘`, 'warning-message');

        gameState.tabletState.questionsAnswered = 0;
        gameState.tabletState.correctAnswers = 0;
        gameState.tabletState.currentQuestionIndex = 0;
        gameState.tabletState.wrongAttempts = {};
    }
}

/**
 * Read tablet notes (after unlock)
 */
export function readTablet() {
    if (!gameState.tabletState.unlocked) {
        addMessage('📱 Tablet is locked. Type "unlock tablet" to authenticate.', 'warning-message');
        return;
    }

    const note = gameState.evidence.sarah_note;
    addMessage(`${note.detailedInfo}

${note.climateLesson}`, 'success-message');

    gameState.tabletState.noteRead = true;
    gameState.examinedEvidence.add('sarah_note');
    note.examined = true;
    updateEvidenceDisplay();
    gameState.learnedConcepts.add('scientific_verification');

    // Check chapter completion
    // Import checkChapterCompletion dynamically to avoid circular dependency
    import('./chapter1-ending.js').then(module => {
        if (typeof module.checkChapterCompletion === 'function') {
            module.checkChapterCompletion();
        }
    });
}
