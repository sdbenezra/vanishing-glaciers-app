/**
 * Speech Manager Module
 *
 * Handles all speech functionality:
 * - Text-to-Speech (TTS) with character voices
 * - Speech-to-Text (STT / Speech Recognition)
 * - Voice indicators
 * - Event-based command submission (to avoid circular dependencies)
 *
 * Dependencies: None (uses browser APIs only)
 * Emits events: 'commandReady' when speech recognition completes
 */

// ============================================
// STATE
// ============================================

// TTS State
let speechEnabled = true;
let currentSpeech = null;
const speechSynthesis = window.speechSynthesis;

// STT State
let recognition = null;
let isListening = false;
let recognitionSupported = false;
let recognitionTimeout = null;
let hasProcessedResult = false;

// Event emitter for cross-module communication
export const speechEvents = new EventTarget();

// Voice settings for different speakers
// Using OFFLINE voices to avoid Google server dependency
export const voices = {
    patel: { rate: 0.95, pitch: 1.1, volume: 1.0 },  // Dr. Patel: Lekha (hi-IN) - Hindi voice, offline
    narrator: { rate: 1.0, pitch: 1.0, volume: 0.9 }  // Narrator: Martha (en-GB) - UK English, offline
};

// ============================================
// TEXT-TO-SPEECH (TTS)
// ============================================

/**
 * Speak text with specified voice settings
 * @param {string} text - Text to speak
 * @param {string} voiceType - Voice type ('patel', 'narrator')
 */
export function speak(text, voiceType = 'narrator') {
    // Check if speech is enabled FIRST
    if (!speechEnabled) {
        console.log('Speech disabled, not speaking');
        return;
    }

    // Stop any current speech (interrupt mode)
    stopSpeech();

    // Clean text for TTS (remove emojis and special formatting)
    const cleanText = text
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
        .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
        .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
        .replace(/[─━]+/g, '') // Remove separator lines

        // Remove character names and labels
        .replace(/Dr\.?\s*Maya\s*Patel/gi, '') // Remove character name
        .replace(/Dr\. /g, 'Doctor ') // Expand abbreviations

        // Scientific units and measurements
        .replace(/(\d+)\.(\d+)/g, '$1 point $2')
        .replace(/(-?\d+\.?\d*)\s*°C/g, '$1 degrees Celsius')
        .replace(/(-?\d+\.?\d*)\s*°F/g, '$1 degrees Fahrenheit')
        .replace(/(\d+\.?\d*)\s*km/g, '$1 kilometers')
        .replace(/(\d+\.?\d*)\s*m\b/g, '$1 meters')
        .replace(/(\d+\.?\d*)\s*cm/g, '$1 centimeters')
        .replace(/(\d+\.?\d*)\s*%/g, '$1 percent')

        // Improve line break handling for natural speech
        .replace(/\n\s*━+\s*\n/g, '. ') // Remove separator line breaks
        .replace(/\n(?=[A-Z][A-Z])/g, '. ') // Newline before all-caps (headers) = period
        .replace(/:\n/g, ': ') // Colon + newline = just space
        .replace(/[:-]/g, ' ') // Replace colons and dashes with spaces
        .replace(/\n\s*[•·]/g, ', ') // Bullet points = commas
        .replace(/\n\s*-\s/g, ', ') // Dash lists = commas
        .replace(/\n(?=[A-Z][a-z])/g, '. ') // Newline before sentence case = period
        .replace(/\n(?=\d)/g, '. ') // Newline before number = period
        .replace(/\n\n+/g, '. ') // Multiple newlines = period
        .replace(/\n/g, ', ') // Remaining single newlines = commas
        .replace(/[•·]/g, '') // Remove any remaining bullets
        .replace(/,\s*,/g, ',') // Clean up double commas
        .replace(/\.\s*,/g, '.') // Period before comma = just period
        .replace(/,\s*\./g, '.') // Comma before period = just period
        .replace(/\s+/g, ' ') // Normalize whitespace

        .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Apply voice settings
    const voiceSettings = voices[voiceType] || voices.narrator;
    utterance.rate = voiceSettings.rate;
    utterance.pitch = voiceSettings.pitch;
    utterance.volume = voiceSettings.volume;

    // Ensure voices are loaded
    let availableVoices = speechSynthesis.getVoices();

    // If voices aren't loaded yet, try again after a short delay
    if (availableVoices.length === 0) {
        speechSynthesis.addEventListener('voiceschanged', () => {
            availableVoices = speechSynthesis.getVoices();
        });
    }

    // Select voice based on speaker type
    if (voiceType === 'patel') {
        // Dr. Patel: Use Lekha (Hindi, offline) - no Google dependency
        const patelVoice = availableVoices.find(voice =>
            voice.name.includes('Lekha') && voice.lang === 'hi-IN'
        );

        if (patelVoice) {
            utterance.voice = patelVoice;
            console.log('Using voice for Dr. Patel:', patelVoice.name);
        } else {
            // Fallback: Any Hindi voice, then female voices
            const fallbackVoice = availableVoices.find(voice =>
                voice.lang === 'hi-IN' ||
                voice.name.includes('Female') ||
                voice.name.includes('female') ||
                voice.name.includes('Victoria') ||
                voice.name.includes('Karen') ||
                voice.name.includes('Moira')
            );

            if (fallbackVoice) {
                utterance.voice = fallbackVoice;
                console.log('Using fallback voice for Dr. Patel:', fallbackVoice.name);
            } else {
                console.log('No preferred voice found for Dr. Patel, using default');
            }
        }
    } else if (voiceType === 'narrator') {
        // Narrator: Use Martha (UK English, offline) - no Google dependency
        const narratorVoice = availableVoices.find(voice =>
            voice.name.includes('Martha') && voice.lang === 'en-GB'
        );

        if (narratorVoice) {
            utterance.voice = narratorVoice;
            console.log('Using voice for narrator:', narratorVoice.name);
        } else {
            // Fallback: Other UK English voices, then any English
            const fallbackVoice = availableVoices.find(voice =>
                voice.lang === 'en-GB' ||
                voice.name.includes('Daniel') ||
                voice.name.includes('Arthur') ||
                voice.name.includes('Moira') ||
                voice.lang.startsWith('en-')
            );

            if (fallbackVoice) {
                utterance.voice = fallbackVoice;
                console.log('Using fallback voice for narrator:', fallbackVoice.name);
            } else {
                console.log('No preferred voice found for narrator, using default');
            }
        }
    }

    // Event handlers
    utterance.onstart = () => {
        showSpeakingIndicator();
    };

    utterance.onend = () => {
        hideSpeakingIndicator();
        currentSpeech = null;
    };

    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        hideSpeakingIndicator();
        currentSpeech = null;
    };

    currentSpeech = utterance;
    speechSynthesis.speak(utterance);
}

/**
 * Toggle mute (enable/disable TTS)
 */
export function toggleMute() {
    speechEnabled = !speechEnabled;
    const muteButton = document.getElementById('muteButton');
    const muteIcon = document.getElementById('muteIcon');
    const muteText = document.getElementById('muteText');

    if (speechEnabled) {
        muteButton.classList.remove('muted');
        muteIcon.textContent = '🔊';
        muteText.textContent = 'Voice On';
        console.log('🔊 Voice enabled');
        // Emit event instead of calling addMessage directly
        speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
            detail: { text: '🔊 Voice narration enabled', className: 'system-message', skipSpeech: true }
        }));
    } else {
        muteButton.classList.add('muted');
        muteIcon.textContent = '🔇';
        muteText.textContent = 'Voice Off';
        stopSpeech();
        console.log('🔇 Voice disabled');
        // Emit event instead of calling addMessage directly
        speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
            detail: { text: '🔇 Voice narration disabled', className: 'system-message', skipSpeech: true }
        }));
    }
}

/**
 * Stop current speech
 */
export function stopSpeech() {
    // Always cancel any ongoing speech, not just if we have a reference
    speechSynthesis.cancel();
    currentSpeech = null;
    hideSpeakingIndicator();
}

/**
 * Show speaking indicator
 */
export function showSpeakingIndicator() {
    const indicator = document.getElementById('speakingIndicator');
    if (indicator) {
        indicator.classList.add('active');
    }
}

/**
 * Hide speaking indicator
 */
export function hideSpeakingIndicator() {
    const indicator = document.getElementById('speakingIndicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
}

// ============================================
// SPEECH-TO-TEXT (STT / SPEECH RECOGNITION)
// ============================================

/**
 * Initialize Speech Recognition
 * Call this once on page load
 */
export function initSpeechRecognition() {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        recognitionSupported = false;
        console.log('Speech recognition not supported in this browser');
        return;
    }

    recognitionSupported = true;
    recognition = new SpeechRecognition();

    // Configure recognition for full phrase capture
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Get interim results to show progress
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-US';

    let finalTranscript = '';
    let silenceTimer = null;

    // Handle results
    recognition.onresult = (event) => {
        let interimTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                console.log('Final result:', transcript);
            } else {
                interimTranscript += transcript;
                console.log('Interim result:', transcript);
            }
        }

        // Update input field with current recognition (interim or final)
        const input = document.getElementById('commandInput');
        if (input) {
            const currentText = (finalTranscript + interimTranscript).trim();
            input.value = currentText;
        }

        // Clear existing silence timer
        if (silenceTimer) {
            clearTimeout(silenceTimer);
        }

        // Set new silence timer - stop after 1.5 seconds of silence
        silenceTimer = setTimeout(() => {
            if (isListening && finalTranscript.trim()) {
                console.log('Silence detected, finalizing...');
                processRecognitionResult(finalTranscript.trim());
            }
        }, 1500);
    };

    // Process final recognition result
    function processRecognitionResult(transcript) {
        if (hasProcessedResult) {
            console.log('Already processed, ignoring');
            return;
        }

        hasProcessedResult = true;

        console.log(`Final transcript: "${transcript}"`);

        // Put the recognized text in the input field
        const input = document.getElementById('commandInput');
        if (input) {
            input.value = transcript;
        }

        // Emit event for UI to show voice input
        speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
            detail: { text: `🎤 Voice input: "${transcript}"`, className: 'player-message', skipSpeech: false }
        }));

        // Stop listening
        stopListening();

        // Emit event for command submission (to be handled by game-engine)
        setTimeout(() => {
            speechEvents.dispatchEvent(new CustomEvent('commandReady', {
                detail: { command: transcript }
            }));
        }, 500);

        // Reset for next use
        finalTranscript = '';
    }

    // Handle errors
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        // Ignore "no-speech" and "aborted" errors as they're normal when stopping
        if (event.error === 'aborted') {
            stopListening();
            return;
        }

        if (event.error === 'no-speech') {
            stopListening();
            speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
                detail: { text: '🎤 No speech detected. Please try again.', className: 'warning-message', skipSpeech: false }
            }));
            return;
        }

        const micButton = document.getElementById('micButton');
        const micIcon = document.getElementById('micIcon');

        if (micButton && micIcon) {
            micButton.classList.remove('listening');
            micButton.classList.add('error');
            micIcon.textContent = '⚠️';
        }

        hideListeningIndicator();
        isListening = false;
        hasProcessedResult = false;
        finalTranscript = '';

        let errorMessage = 'Voice input error. ';
        switch (event.error) {
            case 'audio-capture':
                errorMessage += 'No microphone found. Please check your device settings.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone access denied. Please enable microphone permissions.';
                break;
            case 'network':
                errorMessage += 'Network error. Speech recognition works offline in most browsers.';
                break;
            default:
                errorMessage += 'Please try again or type your command.';
        }

        speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
            detail: { text: errorMessage, className: 'warning-message', skipSpeech: false }
        }));

        // Reset button after 2 seconds
        if (micButton && micIcon) {
            setTimeout(() => {
                micButton.classList.remove('error');
                micIcon.textContent = '🎤';
            }, 2000);
        }
    };

    // Handle end of recognition
    recognition.onend = () => {
        console.log('Speech recognition ended');

        // If we have a final transcript and haven't processed it yet, process it now
        if (finalTranscript.trim() && !hasProcessedResult) {
            processRecognitionResult(finalTranscript.trim());
        } else {
            stopListening();
            finalTranscript = '';
        }
    };

    // Handle start of recognition
    recognition.onstart = () => {
        console.log('Speech recognition started');
        hasProcessedResult = false;
        finalTranscript = '';
    };
}

/**
 * Stop listening
 */
export function stopListening() {
    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (e) {
            console.log('Recognition already stopped');
        }
    }

    const micButton = document.getElementById('micButton');
    const micIcon = document.getElementById('micIcon');

    if (micButton && micIcon) {
        micButton.classList.remove('listening');
        micIcon.textContent = '🎤';
    }

    hideListeningIndicator();
    isListening = false;

    // Clear any pending timeout
    if (recognitionTimeout) {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
    }
}

/**
 * Toggle voice input (start/stop listening)
 */
export function toggleVoiceInput() {
    if (!recognitionSupported) {
        speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
            detail: {
                text: '❌ Voice input is not supported in this browser. Please use Chrome, Edge, or Safari, or type your command.',
                className: 'warning-message',
                skipSpeech: false
            }
        }));
        return;
    }

    if (isListening) {
        // Stop listening
        stopListening();
    } else {
        // Start listening
        try {
            const micButton = document.getElementById('micButton');
            const micIcon = document.getElementById('micIcon');

            if (micButton && micIcon) {
                micButton.classList.add('listening');
                micIcon.textContent = '🎤';
            }

            showListeningIndicator();

            hasProcessedResult = false; // Reset before starting
            recognition.start();
            isListening = true;

            speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
                detail: { text: '🎤 Listening... Speak your command now.', className: 'system-message', skipSpeech: false }
            }));

            // Auto-stop after 10 seconds as safety
            recognitionTimeout = setTimeout(() => {
                if (isListening) {
                    stopListening();
                    speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
                        detail: { text: '🎤 Listening timed out. Please try again.', className: 'warning-message', skipSpeech: false }
                    }));
                }
            }, 10000);
        } catch (error) {
            console.error('Failed to start recognition:', error);
            speechEvents.dispatchEvent(new CustomEvent('systemMessage', {
                detail: { text: '❌ Failed to start voice input. Please try again or type your command.', className: 'warning-message', skipSpeech: false }
            }));
            isListening = false;
            hasProcessedResult = false;
        }
    }
}

/**
 * Show listening indicator
 */
export function showListeningIndicator() {
    const indicator = document.getElementById('listeningIndicator');
    if (indicator) {
        indicator.classList.add('active');
    }
}

/**
 * Hide listening indicator
 */
export function hideListeningIndicator() {
    const indicator = document.getElementById('listeningIndicator');
    if (indicator) {
        indicator.classList.remove('active');
    }
}
