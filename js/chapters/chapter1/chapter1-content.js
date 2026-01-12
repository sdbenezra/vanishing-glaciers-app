/**
 * Chapter 1 Content Module
 *
 * All data for Chapter 1: The Disappearance
 * - Interaction points
 * - Evidence items
 * - Narrative text
 *
 * Pure data module - no dependencies
 */

// Chapter metadata
export const CHAPTER_METADATA = {
    number: 1,
    title: "The Disappearance",
    location: "Polaris Base Research Station - Svalbard, Norway"
};

// Intro text
export const INTRO_TEXT = `🔍 THE VANISHING GLACIERS - CHAPTER 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dr. Sarah Chen has gone missing.

The brilliant climate scientist was last seen at Polaris Base Research
Station in Svalbard, Norway - one of the world's most remote Arctic research
facilities. Her colleagues found the laboratory abandoned, monitoring equipment
still running, showing data that raised urgent questions.

You are a climate investigator, sent to piece together what happened. But this
isn't just a missing person case. The evidence Sarah left behind reveals
something far more significant - a discovery that could change our understanding
of climate change's true pace.

As you examine her research, you'll learn not just what happened to Dr. Chen,
but also the real science behind glaciers, climate monitoring, and the urgent
message frozen in ancient ice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type 'help' to see available commands, or start investigating!`;

// Location description
export const LOCATION_TEXT = `📍 MAIN RESEARCH LABORATORY - POLARIS BASE

You step into Dr. Chen's primary research laboratory. The room hums with the soft whir of monitoring equipment.
Banks of screens display complex data visualizations, their glow casting an eerie light in the Arctic twilight.

The lab is meticulously organized - research papers neatly stacked, equipment properly stored
- but there's an air of abandonment, as if someone left in a hurry.

You can examine:
  • monitoring station - Displays showing glacier temperature data
  • workstation - Dr. Chen's computer and research materials
  • equipment rack - Storage for field research equipment
  • storage freezer - Ultra-cold freezer containing ice core samples
  • satellite display - Wall-mounted screen showing thermal satellite imagery
  • window - Overlooks the glacier research site

Dr. Maya Patel, the station director, is here and willing to answer questions.`;

// Interaction points in the lab
export const INTERACTION_POINTS = {
    monitoring_station: {
        id: 'monitoring_station',
        name: 'Temperature Monitoring Station',
        description: "A bank of monitors displaying real-time temperature data from sensors embedded deep within the glacier. The screens show layers of ice at different depths, with most areas showing cool blues and greens. However, several deep layers - ice that's 800 to 1000 years old - are highlighted in alarming red zones, indicating unexpected warming. The timestamp shows these readings were updated just hours ago.",
        examined: false,
        evidenceId: 'temperature_data'
    },
    workstation: {
        id: 'workstation',
        name: "Dr. Chen's Workstation",
        description: "Dr. Chen's primary computer station with multiple monitors. Research papers are scattered around, and a logbook sits open next to the keyboard. The screen is locked but still glowing.",
        examined: false,
        evidenceId: 'calibration_log'
    },
    equipment_rack: {
        id: 'equipment_rack',
        name: 'Equipment Storage Rack',
        description: 'A metal rack holding various scientific instruments - ice core drills, thermal sensors, sample containers. There\'s a clipboard with equipment checkout logs.\n\n📱 On the top shelf, you notice Dr. Chen\'s field tablet, screen still glowing faintly. The device shows a security lock screen.',
        examined: false,
        evidenceId: 'sarah_note',
        specialItem: 'tablet'
    },
    storage_freezer: {
        id: 'storage_freezer',
        name: 'Sample Storage Freezer',
        description: 'A large ultra-cold freezer (-80°C) housing ice core samples. Through the frosted glass door, you can see rows of cylindrical cores in protective sleeves. A recent sample sits in the quick-access compartment, its layers clearly visible through the clear plastic tube.',
        examined: false,
        evidenceId: 'ice_core_sample'
    },
    satellite_display: {
        id: 'satellite_display',
        name: 'Satellite Data Display',
        description: 'A secondary monitor mounted on the wall displays real-time satellite imagery. The screen shows a false-color thermal map of the glacier - bright reds and oranges indicate warmer areas, while blues show colder regions. Surprisingly, there are red patches where the ice should be uniformly cold.',
        examined: false,
        evidenceId: 'satellite_thermal_image'
    },
    window: {
        id: 'window',
        name: 'Observation Window',
        description: 'A large window overlooking the glacier research site. Through the glass, you can see the white expanse of ice stretching toward the mountains. Sensor arrays dot the landscape, their lights blinking in the Arctic twilight.',
        examined: false,
        evidenceId: null
    }
};

// Evidence items
export const EVIDENCE_DATA = {
    temperature_data: {
        id: 'temperature_data',
        name: 'Temperature Monitoring Data',
        description: 'Active displays showing temperature readings from glacier sensors. The deep ice layers (800 to 1000 years old) show unusual red zones.',
        detailedInfo: `TEMPERATURE GRADIENT ANALYSIS - DEEP ICE LAYERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Depth: 800 to 1000 year layers
Current Reading: -12.3°C
Historical Average: -14.6°C
Deviation: +2.3°C (157% above normal variation)

Status: CRITICAL - Temperature increase exceeds all historical records
Last Updated: May 3, 23:47
Updated By: S. Chen

The warming is concentrated in specific layers, suggesting external heat sources affecting ancient ice that should remain stable.`,
        climateLesson: `
📚 CLIMATE SCIENCE CONCEPT: Glacier Temperature Monitoring
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scientists monitor glacier temperatures at different depths to understand:

• Surface layers respond to seasonal changes
• Deep layers (hundreds of years old) should remain stable
• Unexpected warming in deep ice signals major environmental changes
• Temperature sensors measure thermal gradients (heat flow patterns)

When deep ice warms unexpectedly, it indicates:
→ Climate change is affecting even the most stable ice
→ The glacier's structural integrity may be compromised
→ Accelerated melting may be underway`,
        discovered: false,
        examined: false
    },
    calibration_log: {
        id: 'calibration_log',
        name: 'Sensor Calibration Log',
        description: "A detailed logbook tracking sensor calibration and maintenance. Dr. Chen's handwriting fills the margins with notes and calculations.",
        detailedInfo: `SENSOR CALIBRATION LOG - WEEK OF APRIL 28
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
April 28: Routine calibration - all sensors nominal
April 30: Deep layer sensors flagged for recalibration
          [Note: Readings exceeded expected parameters]
May 1:    Recalibrated deep sensors x2 - same results
          [S.C.: NOT equipment error. Readings are accurate.]
May 2:    Triple-checked calibration standards
          [S.C.: Temperature increase is REAL. Must verify on-site.]
May 3:    Cross-referenced with satellite thermal data
          [S.C.: Satellite confirms. This is accelerating. URGENT.]

The repeated calibrations show Dr. Chen was trying to rule out equipment malfunction. When that failed, she had to accept the readings were genuine.`,
        climateLesson: `
📚 CLIMATE SCIENCE CONCEPT: Data Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
When scientists observe unusual data, they must verify it's real:

1. Calibrate instruments to ensure accuracy
2. Cross-reference with other measurement methods
3. Rule out equipment malfunction or human error
4. Compare with independent data sources (like satellites)

Only after thorough verification can scientists confirm that unexpected readings represent actual environmental changes.

Dr. Chen's repeated calibrations show scientific rigor - she wouldn't accept alarming data without proof it was accurate.`,
        discovered: false,
        examined: false
    },
    sarah_note: {
        id: 'sarah_note',
        name: "Dr. Chen's Encrypted Field Notes",
        description: 'Encrypted field notes on Sarah\'s tablet. Requires authentication.',
        detailedInfo: `DR. CHEN'S FIELD NOTES - DECRYPTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: May 3, 2025 - 23:52

K -

If you're reading this, I haven't returned by 06:00.

The data is worse than we thought. Deep ice temps rising 2.3°C - faster than any model predicted. I need to verify the thermal readings on-site before going public.

Taking core drill and thermal probe to sector 7-B.
Backup data encrypted on secure drive (you know where).

If confirmed: critical destabilization. The glacier could lose structural integrity within months, not years.

Use winter protocol if I don't return.

- S`,
        climateLesson: `
📚 CLIMATE SCIENCE: Scientific Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scientists verify extraordinary findings through:
• Multiple equipment calibrations (ruling out sensor error)
• Cross-referencing independent data sources
• Collecting physical evidence
• Ensuring findings can be replicated

Dr. Chen's approach demonstrates proper scientific protocol.`,
        discovered: false,
        examined: false,
        requiresUnlock: true
    },
    ice_core_sample: {
        id: 'ice_core_sample',
        name: 'Ice Core Sample',
        description: 'A cylindrical ice core about 1 meter long, extracted from deep within the glacier. Through the clear plastic sleeve, you can see distinct annual layers - dark bands alternating with lighter ice.',
        detailedInfo: `ICE CORE SAMPLE #GS-2024-047
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection Date: April 15, 2024
Depth: 850 to 950 meters
Estimated Age Range: 800 to 900 years before present
Core Diameter: 10 cm
Status: Preliminary analysis complete

VISIBLE FEATURES:
• 143 distinct annual layers (summer/winter cycles)
• Ash layer at ~820 years (volcanic eruption marker)
• Bubble concentration varies by season
• Recent layers show unusual clarity (less debris)

ANALYSIS NOTES (S. Chen):
"Layer spacing in top 50 years shows acceleration. Annual bands getting thicker - more melt/refreeze cycles. This core confirms the temperature sensor readings. The ice itself is telling us the climate is changing.

Compare to core GS-2019-031 from same depth: that core showed consistent layer spacing for entire 900-year period. Five years later, THIS core shows dramatic change in recent decades.

The evidence is literally frozen in time."

[A small photo is attached showing Dr. Chen holding the core, smiling, dated three weeks ago]`,
        climateLesson: `
📚 CLIMATE SCIENCE CONCEPT: Ice Cores as Climate Archives
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ice cores are like time machines that preserve Earth's climate history:

HOW ICE CORES WORK:
• Annual layers form like tree rings (winter snow, summer melt)
• Each layer traps air bubbles from that year's atmosphere
• Scientists count layers to determine age (like counting rings)
• Chemical analysis reveals temperature, CO2, pollution levels

WHAT WE LEARN:
• Climate patterns over thousands of years
• Historical CO2 and methane levels
• Volcanic eruptions (ash layers)
• Industrial pollution markers

WHY THIS MATTERS:
Ice cores from Greenland and Antarctica show us:
→ Natural climate cycles vs. human-caused changes
→ How fast climate CAN change (and how fast it IS changing now)
→ What "normal" looks like for comparison

The layer spacing acceleration Dr. Chen noted shows climate change is happening faster than the historical record - these recent decades are unprecedented in 800 years of ice.`,
        discovered: false,
        examined: false
    },
    satellite_thermal_image: {
        id: 'satellite_thermal_image',
        name: 'Satellite Thermal Image',
        description: 'A false-color satellite image showing thermal readings of the glacier. The image uses color coding - deep blue for coldest areas, transitioning through green, yellow, orange to bright red for warmest. Critical red hotspots appear in areas that should be uniformly cold.',
        detailedInfo: `SATELLITE THERMAL IMAGING DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Satellite: MODIS Terra/Aqua
Image Date: May 3, 2025 - 14:32 UTC
Resolution: 30 meters per pixel
Wavelength: Thermal Infrared (10.78-11.28 μm)
Processing: False-color composite

TEMPERATURE DISTRIBUTION:
🔵 Blue zones (-18°C to -15°C): Normal glacier temp - 68% coverage
🟢 Green zones (-15°C to -13°C): Slightly elevated - 18% coverage
🟡 Yellow zones (-13°C to -11°C): Concerning - 9% coverage
🟠 Orange zones (-11°C to -9°C): Critical - 4% coverage
🔴 Red zones (-9°C and above): Extreme alarm - 1% coverage

ANOMALY REPORT:
Red zones detected in deep ice layers (800 to 1000 year strata) match the locations of Dr. Chen's ground sensor readings. This independent confirmation from space validates the temperature anomalies.

ANALYSIS NOTES:
"Ground sensors and satellite data show identical patterns. The thermal signature is REAL.

Satellite data advantages:
- No physical contact with ice (can't be faulty equipment)
- Measures actual infrared radiation emitted by glacier
- Covers entire glacier simultaneously
- Updated every 12 hours

Space-based and ground-based measurements agree - the data is accurate."

Last viewed by: S. Chen (May 3, 23:52)`,
        climateLesson: `
📚 CLIMATE SCIENCE CONCEPT: Remote Sensing & Thermal Imaging
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Satellites are crucial tools for monitoring Earth's climate, especially in remote areas like the Arctic.

HOW THERMAL SATELLITE IMAGING WORKS:
• All objects emit infrared radiation based on their temperature
• Satellites detect this radiation from space using special sensors
• Different wavelengths reveal different surface properties
• False-color images convert invisible IR to visible colors for analysis
• Red = warmer, Blue = colder (colors are assigned, not "real")

WHY SATELLITES MATTER FOR CLIMATE RESEARCH:
✓ Global Coverage: Monitor entire glaciers, ice sheets, oceans at once
✓ Consistency: Same sensor, same method, every measurement
✓ Accessibility: Reach dangerous or remote areas safely
✓ Historical Record: Decades of continuous data for comparison
✓ Independence: Confirms ground measurements from a different source

Dr. Chen's ground sensors showed warming. The satellites confirmed it from space. Two different technologies, same conclusion: the warming is real.`,
        discovered: false,
        examined: false
    }
};

// Security questions for tablet unlock
export const SECURITY_QUESTIONS = {
    temperature: {
        id: 'temperature',
        requiredEvidence: 'temperature_data',
        question: `QUESTION {num} OF 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What temperature deviation (in degrees Celsius) did I observe in the deep ice layers?

Format: Enter number with one decimal (example: 2.3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        answer: 2.3,
        tolerance: 0.05,
        correctMsg: '✓ CORRECT\n\nThe 2.3°C deviation was unprecedented in our historical data.\n\nQuestions Answered: {count}/4',
        incorrectMsg: '✗ INCORRECT\n\nCheck the monitoring station displays - look for deep ice layer readings.',
        hint1: 'The monitoring station shows temperature readings from different ice depths. Look for deviation in deep layers (800-1000 year old ice).',
        hint2: 'Find "Deviation: +[number]°C" in the deep ice layer data on the monitoring station.'
    },
    calibration: {
        id: 'calibration',
        requiredEvidence: 'calibration_log',
        question: `QUESTION {num} OF 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
How many times did I recalibrate the deep layer sensors?

Format: Enter just the number (example: 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        answer: 3,
        tolerance: 0,
        correctMsg: '✓ CORRECT\n\nThree complete recalibrations to ensure equipment wasn\'t malfunctioning.\n\n📚 Scientists verify unexpected findings through equipment calibration.\n\nQuestions Answered: {count}/4',
        incorrectMsg: '✗ INCORRECT\n\nCheck the calibration log at the workstation.',
        hint1: 'The calibration log shows multiple recalibration entries. Count the full recalibrations.',
        hint2: 'Look for entries on April 30, May 1, and May 2 showing complete recalibration cycles.'
    },
    ice_core_age: {
        id: 'ice_core_age',
        requiredEvidence: 'ice_core_sample',
        question: `QUESTION {num} OF 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What is the approximate age (years before present) of the OLDER end of my ice core sample's range?

Format: Enter the number (example: 100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        answer: 900,
        tolerance: 50,
        correctMsg: '✓ CORRECT\n\nThe 800-900 year old ice should be thermally stable - any warming indicates fundamental shift.\n\n📚 Ice cores preserve climate history in annual layers like tree rings.\n\nQuestions Answered: {count}/4',
        incorrectMsg: '✗ INCORRECT\n\nCheck the ice core sample details in the storage freezer.',
        hint1: 'The ice core shows "Estimated Age Range" in years. You need the older (higher) number.',
        hint2: 'Look for "800 to 900 years before present". The answer is 900.'
    },
    satellite_percentage: {
        id: 'satellite_percentage',
        requiredEvidence: 'satellite_thermal_image',
        question: `QUESTION {num} OF 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
What percentage of the glacier showed red zones (extreme alarm)?

Format: Enter just the number (example: 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        answer: 1,
        tolerance: 0,
        correctMsg: '✓ CORRECT\n\n1% sounds small, but that\'s ancient ice showing critical warming. When satellite and ground measurements agree, the data is real.\n\n📚 Remote sensing provides independent verification.\n\nQuestions Answered: {count}/4',
        incorrectMsg: '✗ INCORRECT\n\nCheck the satellite thermal image display.',
        hint1: 'The satellite data shows temperature distribution by color zones. Look for red zone percentage.',
        hint2: 'Find "🔴 Red zones: Extreme alarm - [number]% coverage".'
    }
};
