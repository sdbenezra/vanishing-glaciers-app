/**
 * UI Manager Module
 *
 * Handles all UI operations:
 * - Message display
 * - Evidence panel
 * - Help popup
 * - Modal dialogs
 * - Progress display
 *
 * Dependencies: game-state.js, speech-manager.js, ai-integration.js
 */

import { gameState } from '../shared/game-state.js';
import { speak, speechEvents } from './speech-manager.js';

// AI integration will be imported dynamically to avoid circular dependencies
let toggleAIMode = null;

/**
 * Set AI toggle function (called after ai-integration.js loads)
 * @param {Function} fn - The toggleAIMode function
 */
export function setToggleAIModeFunction(fn) {
    toggleAIMode = fn;
}

/**
 * Add a message to the chat display
 * @param {string} text - Message text
 * @param {string} className - CSS class for styling (system-message, player-message, etc.)
 * @param {boolean} skipSpeech - If true, don't trigger TTS
 */
export function addMessage(text, className = 'system-message', skipSpeech = false) {
    const chatDisplay = document.getElementById('chatDisplay');
    const message = document.createElement('div');
    message.className = `message ${className}`;
    message.textContent = text;
    chatDisplay.appendChild(message);

    // Trigger TTS based on message type and content (unless skipSpeech is true)
    if (!skipSpeech) {
        // Priority 1: Check if this is actual character dialogue (starts with speaker identifier)
        if (text.startsWith('🗣️  Dr. Patel:') || text.startsWith('🗣️  Dr. Maya Patel')) {
            speak(text, 'patel');
        }
        // Priority 2: System messages and narration (even if they mention characters)
        else if (className === 'system-message' || className === 'success-message') {
            // Speak system messages with narrator voice
            // This includes location descriptions, evidence discoveries, etc.
            speak(text, 'narrator');
        }
        // Priority 3: Don't speak player input, warnings, or separators
        // (player-message, warning-message, separator classes are not spoken)
    }

    // Scroll to show the beginning of the new message
    // Use a small timeout to ensure the element is rendered
    setTimeout(() => {
        message.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 10);
}

/**
 * Add a visual separator line
 */
export function addSeparator() {
    addMessage('─'.repeat(70), 'separator', true);
}

/**
 * Update the evidence panel display
 * Shows all evidence items and their status (undiscovered/found/examined)
 */
export function updateEvidenceDisplay() {
    const evidenceList = document.getElementById('evidenceList');
    evidenceList.innerHTML = '';

    for (const [evidenceId, evidence] of Object.entries(gameState.evidence)) {
        const item = document.createElement('div');
        item.className = 'evidence-item';

        if (evidence.examined) {
            item.classList.add('evidence-examined');
            item.classList.add('clickable');
            item.innerHTML = `
                <div class="evidence-status">✓</div>
                <div class="evidence-name">${evidence.name}</div>
                <div class="evidence-badge">EXAMINED</div>
                <div class="evidence-view-icon">👁️</div>
            `;
            // Make clickable to view details
            item.style.cursor = 'pointer';
            item.title = 'Click to view details';
            item.addEventListener('click', () => showEvidenceDetails(evidenceId));
        } else if (evidence.discovered) {
            item.classList.add('evidence-found');
            item.classList.add('clickable');
            item.innerHTML = `
                <div class="evidence-status">○</div>
                <div class="evidence-name">${evidence.name}</div>
                <div class="evidence-badge">FOUND</div>
                <div class="evidence-view-icon">👁️</div>
            `;
            // Make clickable to view details
            item.style.cursor = 'pointer';
            item.title = 'Click to view details';
            item.addEventListener('click', () => showEvidenceDetails(evidenceId));
        } else {
            item.classList.add('evidence-undiscovered');
            item.innerHTML = `
                <div class="evidence-status">·</div>
                <div class="evidence-name">???</div>
                <div class="evidence-badge">UNDISCOVERED</div>
            `;
        }

        evidenceList.appendChild(item);
    }

    // Update progress summary
    const total = Object.keys(gameState.evidence).length;
    const found = gameState.discoveredEvidence.size;
    const examined = gameState.examinedEvidence.size;

    document.getElementById('progressSummary').innerHTML = `
        Evidence: ${found} of ${total} found.<br>
        Examined: ${examined} of ${total}.
    `;
}

/**
 * Show evidence details in a modal
 * @param {string} evidenceId - ID of the evidence to display
 */
export function showEvidenceDetails(evidenceId) {
    const evidence = gameState.evidence[evidenceId];
    if (!evidence || !evidence.discovered) return;

    const modal = document.getElementById('saveModal');
    const title = document.getElementById('saveModalTitle');
    const content = document.getElementById('saveModalContent');

    if (!modal || !title || !content) return;

    title.textContent = `📋 ${evidence.name}`;

    // Show different content based on examination status
    let detailsHTML = `
        <div style="color: #a8c5da; line-height: 1.8;">
            <div style="margin-bottom: 20px; padding: 15px; background: #2a3f5f; border-radius: 5px;">
                <strong style="color: #4dd0e1;">Description:</strong>
                <p style="margin-top: 10px;">${evidence.description}</p>
            </div>
    `;

    if (evidence.examined && evidence.detailedInfo) {
        detailsHTML += `
            <div style="margin-bottom: 20px; padding: 15px; background: #1a2332; border-radius: 5px; border: 2px solid #4dd0e1;">
                <strong style="color: #81c784;">Detailed Analysis:</strong>
                <pre style="margin-top: 10px; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 13px; color: #e0f4ff;">${evidence.detailedInfo}</pre>
            </div>
        `;

        if (evidence.climateLesson) {
            detailsHTML += `
                <div style="margin-bottom: 20px; padding: 15px; background: #2a3f5f; border-radius: 5px; border-left: 4px solid #81c784;">
                    <pre style="white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 13px; color: #a8c5da;">${evidence.climateLesson}</pre>
                </div>
            `;
        }
    } else {
        detailsHTML += `
            <div style="margin-top: 20px; padding: 15px; background: #1a2332; border-radius: 5px; border: 2px solid #ffab40;">
                <p style="color: #ffab40;">💡 <strong>Tip:</strong> Use the EXAMINE command on this evidence to view detailed analysis and learn more.</p>
            </div>
        `;
    }

    detailsHTML += '</div>';
    content.innerHTML = detailsHTML;
    modal.classList.add('active');
}

/**
 * Toggle the evidence panel open/closed
 */
export function toggleEvidence() {
    const panel = document.getElementById('evidencePanel');
    gameState.evidencePanelOpen = !gameState.evidencePanelOpen;

    if (gameState.evidencePanelOpen) {
        panel.classList.remove('collapsed');
    } else {
        panel.classList.add('collapsed');
    }
}

/**
 * Open the evidence panel (used when new evidence is found)
 */
export function openEvidencePanel() {
    const panel = document.getElementById('evidencePanel');
    gameState.evidencePanelOpen = true;
    panel.classList.remove('collapsed');
}

/**
 * Toggle the help popup
 */
export function toggleHelp() {
    const popup = document.getElementById('helpPopup');
    popup.classList.toggle('active');
}

/**
 * Show the AI confirmation popup
 */
export function showAIConfirmation() {
    // If AI is already on, turn it off
    if (gameState.aiMode && toggleAIMode) {
        toggleAIMode();
        return;
    }

    // Show confirmation popup
    const popup = document.getElementById('aiConfirmationPopup');
    if (popup) {
        popup.classList.add('active');
    }
}

/**
 * Close the AI confirmation popup
 */
export function closeAIConfirmation() {
    const popup = document.getElementById('aiConfirmationPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

/**
 * Confirm and enable AI mode
 */
export function confirmAIMode() {
    closeAIConfirmation();
    if (toggleAIMode) {
        toggleAIMode();
    } else {
        console.warn('[UI] toggleAIMode function not yet set');
    }
}

/**
 * Initialize UI event listeners
 * Call this once on page load
 */
export function initializeUIListeners() {
    // Close help popup when clicking outside
    const helpPopup = document.getElementById('helpPopup');
    if (helpPopup) {
        helpPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                toggleHelp();
            }
        });
    }

    // Close AI confirmation when clicking outside
    const aiPopup = document.getElementById('aiConfirmationPopup');
    if (aiPopup) {
        aiPopup.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAIConfirmation();
            }
        });
    }

    // Listen for system messages from speech-manager
    speechEvents.addEventListener('systemMessage', (e) => {
        const { text, className, skipSpeech } = e.detail;
        addMessage(text, className, skipSpeech);
    });
}
