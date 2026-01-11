/**
 * Chapter 1 Logic Module - "The Disappearance"
 *
 * Chapter-specific gameplay logic:
 * - Initialization and intro sequence
 * - Location descriptions
 * - NPC dialogue (Dr. Maya Patel)
 * - Evidence presentation to NPCs
 *
 * Dependencies: chapter1-content.js, game-state.js, ui-manager.js
 */

import {
    CHAPTER_METADATA,
    INTRO_TEXT,
    LOCATION_TEXT,
    INTERACTION_POINTS,
    EVIDENCE_DATA
} from './chapter1-content.js';
import { gameState } from '../../shared/game-state.js';
import { addMessage, addSeparator, updateEvidenceDisplay } from '../../core/ui-manager.js';

// ============================================
// CHAPTER INITIALIZATION
// ============================================

/**
 * Initialize Chapter 1 game data
 */
export function initializeChapter() {
    // Create fresh copies of interaction points and evidence to avoid mutation
    // Deep clone to ensure nested objects are also copied
    gameState.interactionPoints = JSON.parse(JSON.stringify(INTERACTION_POINTS));
    gameState.evidence = JSON.parse(JSON.stringify(EVIDENCE_DATA));

    // Show intro and update UI
    showIntro();
    updateEvidenceDisplay();
}

/**
 * Clear game output display
 */
export function clearGameOutput() {
    const chatDisplay = document.getElementById('chatDisplay');
    if (chatDisplay) {
        chatDisplay.innerHTML = '';
    }
}

// ============================================
// DISPLAY FUNCTIONS
// ============================================

/**
 * Show chapter introduction
 */
export function showIntro() {
    const intro = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAPTER 1: INITIAL INVESTIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a climate investigator called to Polaris Base Research Station in
Svalbard, Norway. Dr. Sarah Chen, a brilliant glaciologist, has gone missing
under mysterious circumstances.

Your mission: Investigate her laboratory to discover what happened.

Along the way, you'll learn about glacier science and why this research
matters for our planet's future.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMANDS:
• look - Describe your surroundings
• examine [object] - Investigate something closely
• talk to maya - Speak with Dr. Patel
• You can also ask natural questions like "why does this matter?"
• inventory - View evidence found
• progress - Check investigation status
• help - Show all commands

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👉 Type 'look' to begin your investigation...`;
    addMessage(intro);
}

/**
 * Show current location description
 */
export function showLocation() {
    addSeparator();
    const location = `📍 MAIN RESEARCH LABORATORY - POLARIS BASE

You step into Dr. Chen's primary research laboratory. The room hums with the
soft whir of monitoring equipment. Banks of screens display complex data
visualizations, their glow casting an eerie light in the Arctic twilight.

The lab is meticulously organized - research papers neatly stacked, equipment
properly stored - but there's an air of abandonment, as if someone left in a hurry.

You can examine:
  • monitoring station - Displays showing glacier temperature data
  • workstation - Dr. Chen's computer and research materials
  • equipment rack - Storage for field research equipment
  • storage freezer - Ultra-cold freezer containing ice core samples
  • satellite display - Wall-mounted screen showing thermal satellite imagery
  • window - Overlooks the glacier research site

Dr. Maya Patel, the station director, is here and willing to answer questions.`;
    addMessage(location);
}

// ============================================
// NPC DIALOGUE - DR. MAYA PATEL
// ============================================

/**
 * Get Maya's initial greeting
 * @returns {string} Maya's greeting message
 */
export function getMayaGreeting() {
    // IMPORTANT: Character dialogue MUST start with the speaker identifier format:
    // "🗣️  [Character Name]:"
    // This is how the TTS system knows which voice to use.
    // Do NOT include this prefix in system messages that mention the character.
    return `🗣️  Dr. Maya Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Thank goodness you're here. Dr. Sarah Chen has been missing since early this morning. She's one of our most dedicated researchers - this is completely unlike her.

She was working late last night on some concerning data. I'm worried something may have happened. Please, look around the lab and see if you can find any clues about where she might have gone.

If you find anything, or if you have questions about the research we do here, please ask me. I want to help however I can."`;
}

/**
 * Get Maya's response to a topic or question
 * @param {string} topic - The topic or question
 * @returns {string} Maya's response
 */
export function getMayaResponse(topic) {
    // All Dr. Patel responses use the same speaker identifier prefix
    topic = topic.toLowerCase().trim();
    console.log('getMayaResponse called with topic:', topic);

    // Why it matters / Importance - check this FIRST before other keywords
    if (topic.includes('why') || topic.includes('matter') || topic.includes('important') ||
        topic.includes('importance') || topic.includes('concern') ||
        topic.includes('significant') || topic.includes('care') ||
        topic === 'importance') {
        console.log('Matched: why/matter/important');
        gameState.learnedConcepts.add('glacier_importance');
        return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Glaciers might seem remote, but they affect everyone on Earth:

When glaciers melt, they add water to the oceans, raising sea levels. Coastal cities worldwide face flooding risks from this.

They also regulate freshwater supplies. Billions of people depend on glacier-fed rivers for drinking water, agriculture, and hydroelectric power.

Rapid glacier melting disrupts ecosystems - both the wildlife that depends on glacier environments and the communities downstream that depend on steady, predictable water flow.

That's why Dr. Chen's work was so important. Understanding how fast glaciers are changing helps us prepare for and potentially slow these impacts."`;
    }

    // Glacier research
    if (topic.includes('glacier') || topic.includes('ice') || topic.includes('research') || topic.includes('study')) {
        gameState.topicsDiscussed.add('glacier_research');
        gameState.learnedConcepts.add('glacier_monitoring');
        return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"We study glaciers because they're critical indicators of climate change. Think of them as Earth's thermometer - they respond to temperature changes over time, preserving a record of climate history in their ice layers.

Here at Polaris Base, we focus on monitoring glacier stability and temperature patterns. We have sensors embedded at different depths, measuring how heat moves through the ice.

This matters because glaciers aren't just beautiful landscapes - they regulate sea levels, provide freshwater to billions of people, and support entire ecosystems. When they change rapidly, it affects us all."`;
    }

    // Ice cores specifically
    if (topic.includes('ice core') || topic.includes('sample') || topic.includes('freezer') || topic.includes('layer')) {
        gameState.topicsDiscussed.add('ice_cores');
        gameState.learnedConcepts.add('ice_core_analysis');

        if (gameState.examinedEvidence.has('ice_core_sample')) {
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Yes, the ice core in the freezer! That's one of Sarah's most recent extractions. Ice cores are fascinating - they're like books written in frozen water. Each layer tells a story about the climate when that snow fell.

The layer spacing Sarah noted in her analysis is particularly concerning. When layers get thicker and more irregular, it indicates more melt-refreeze cycles. That core shows 800 years of consistent patterns, then sudden changes in recent decades.

It's physical proof of what the sensors are telling us - the climate is changing, and it's happening faster than the historical record shows."`;
        } else {
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"We have an ice core in the storage freezer if you'd like to examine it. Ice cores are some of our most valuable climate archives - they preserve atmospheric conditions from when the snow fell, sometimes thousands of years ago.

Sarah was particularly skilled at ice core analysis. She could read those layers like a historian reading ancient manuscripts."`;
        }
    }

    // Monitoring
    if (topic.includes('monitoring') || topic.includes('sensor') || topic.includes('temperature') || topic.includes('measure')) {
        gameState.topicsDiscussed.add('monitoring_system');
        gameState.learnedConcepts.add('temperature_monitoring');
        return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The monitoring station is the heart of our work. We use an array of high-precision temperature sensors placed at different depths in the glacier.

Surface sensors track daily and seasonal changes, but the deep sensors - those measuring ice that's hundreds or thousands of years old - those should be very stable. They're monitoring ice that formed centuries ago.

When we see unexpected temperature changes in those deep layers, it's significant. It means something fundamental is changing in the glacier's thermal structure.

The displays use color coding - blue for normal ranges, yellow for elevated, red for critical. Dr. Chen had been watching those red zones with growing concern..."`;
    }

    // Data
    if (topic.includes('data') || topic.includes('reading') || topic.includes('finding') || topic.includes('discover')) {
        gameState.topicsDiscussed.add('concerning_data');

        if (gameState.examinedEvidence.has('temperature_data')) {
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Yes, I see you've found the temperature data. Those readings had Dr. Chen very worried. A 2.3 degree increase in ice that should be stable... that's not normal variation. That's a fundamental change.

She spent days verifying the sensors weren't malfunctioning. When she confirmed the readings were accurate, she became very focused. She said she needed to verify something in person before... well, before she could be certain of what it meant."`;
        } else {
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Dr. Chen was investigating some very concerning temperature readings from the deep ice layers. She was working late every night last week, cross-referencing data, running calibrations...

If you examine the monitoring station, you might see what had her so worried."`;
        }
    }

    // Sarah's disappearance
    if (topic.includes('sarah') || topic.includes('chen') || topic.includes('missing') || topic.includes('disappear') || topic.includes('where')) {
        gameState.topicsDiscussed.add('sarah_disappearance');

        if (gameState.examinedEvidence.has('sarah_note')) {
            gameState.talkedToMaya = true;
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Her note! So she went to sector 7-B to verify the thermal readings in person. That makes sense now.

Sarah is meticulous - she wouldn't make alarming claims without absolute certainty. If the deep ice is warming that rapidly, the implications are severe. Structural destabilization, accelerated melting, ecosystem impacts...

The 'winter protocol' she mentioned - that's our emergency data preservation procedure. It means she wanted to ensure her findings would be protected if something happened to her.

I need to organize a search team to sector 7-B immediately. But thanks to your investigation, at least now we know where to look and why she went. She wasn't in danger - she was being a scientist, following the data wherever it led."`;
        } else if (gameState.examinedEvidence.size >= 2) {
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The evidence you've found suggests she was investigating something urgent. The temperature anomalies, the repeated calibrations... she was building a case for something significant.

But I still don't know where she went or why she left so suddenly. Keep investigating - there must be something that explains her departure."`;
        } else {
            return `🗣️  Dr. Patel:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Sarah Chen is brilliant but also very methodical. She wouldn't just vanish without reason. If you can find evidence of what she was working on, it might tell us where she went and why.

Please, examine the lab carefully. Her workstation, the monitoring equipment - anything might be a clue."`;
        }
    }

    // Default
    return `🗣️  Dr. Patel:

"I'm not sure I understand. You can ask me about:
• Our glacier research
• How we monitor temperatures
• Why this work matters
• Dr. Chen's disappearance

Or you can show me any evidence you've found."`;
}

/**
 * Show evidence to Maya and get her response
 * @param {string} evidenceId - The evidence ID to show
 * @returns {string} Maya's response to the evidence
 */
export function showEvidenceToMaya(evidenceId) {
    const evidence = gameState.evidence[evidenceId];

    if (!evidence || !evidence.discovered) {
        return `🗣️  Dr. Patel:

"I don't see what you're referring to. Have you found that evidence yet?"`;
    }

    // Maya's responses based on specific evidence
    if (evidenceId === 'temperature_data') {
        return `🗣️  Dr. Patel:

"Yes, those temperature readings are what had Sarah so concerned. A 2.3 degree increase in ice that should be stable... that's unprecedented in our records.

The deep ice layers - those 800 to 1000 year old layers - should have very stable temperatures. When we see that kind of change, it signals something fundamental is happening to the glacier's thermal structure."`;
    }

    if (evidenceId === 'calibration_log') {
        return `🗣️  Dr. Patel:

"Ah, the calibration log. This shows how thorough Sarah was being. She verified those sensors multiple times because the readings were so alarming.

See how she kept recalibrating? She wanted to be absolutely certain the equipment wasn't malfunctioning. When every test confirmed the same results, she had to accept that the temperature increase was real."`;
    }

    if (evidenceId === 'sarah_note') {
        gameState.talkedToMaya = true;
        return `🗣️  Dr. Patel:

"Her note! So she went to sector 7-B to verify the thermal readings in person. That makes sense now.

Sarah is meticulous - she wouldn't make alarming claims without absolute certainty. If the deep ice is warming that rapidly, the implications are severe. Structural destabilization, accelerated melting, ecosystem impacts...

The 'winter protocol' she mentioned - that's our emergency data preservation procedure. It means she wanted to ensure her findings would be protected if something happened to her.

I need to organize a search team to sector 7-B immediately. But thanks to your investigation, at least now we know where to look and why she went."`;
    }

    if (evidenceId === 'ice_core_sample') {
        return `🗣️  Dr. Patel:

"Yes, this ice core is particularly important. See those annual layers? They're like tree rings - each one represents a year of snowfall.

Sarah noted that the spacing in the top 50 years shows acceleration. The bands are getting thicker, which indicates more melt-refreeze cycles. This core provides physical proof that matches what the temperature sensors are telling us.

What's remarkable is comparing this to the core from five years ago. That earlier core showed consistent patterns for 900 years. This one shows dramatic changes in recent decades. The ice itself is recording the climate change."`;
    }

    if (evidenceId === 'satellite_thermal_image') {
        return `🗣️  Dr. Patel:

"The satellite data! This is crucial because it's completely independent from our ground sensors. Two different measurement systems - one on the ground, one in space - both showing the same warming patterns.

That red zone distribution matches exactly where Sarah's sensors detected the temperature anomalies. When you have multiple independent data sources all pointing to the same conclusion, that's when you know the finding is solid.

This kind of verification is exactly what Sarah needed before going public with such significant results."`;
    }

    // Default for any other evidence
    return `🗣️  Dr. Patel:

"Thank you for showing me this. Every piece of evidence helps us understand what Sarah was investigating and why she felt it was so urgent."`;
}
