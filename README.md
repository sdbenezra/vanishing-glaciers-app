# ❄️ The Vanishing Glaciers ❄️

**An Interactive Environmental Mystery Series**

## Chapter 1: "The Disappearance"

A text-based adventure game that combines mystery-solving with climate science education. Investigate the disappearance of Dr. Sarah Chen at an Arctic research station while learning about glaciology, climate monitoring, and the urgent realities of climate change.

---

## 🎮 About The Game

Dr. Sarah Chen, a brilliant climate scientist, has gone missing from Polaris Base Research Station in Svalbard, Norway. As a climate investigator, you must piece together what happened by examining her laboratory, analyzing scientific evidence, and uncovering a discovery that could change our understanding of climate change.

This isn't just a mystery game—it's an educational experience that teaches real climate science concepts through interactive storytelling.

---

## ✨ Features

### 🎭 Interactive Storytelling
- Explore an Arctic research laboratory
- Examine scientific equipment and evidence
- Interview Dr. Maya Patel, the station director
- Unlock encrypted field notes through puzzle-solving

### 🔊 Voice Features
- **Text-to-Speech (TTS)**: Full voice narration with character voices
  - Narrator: UK English voice (Martha)
  - Dr. Maya Patel: Hindi voice (Lekha)
- **Speech-to-Text (STT)**: Voice command input
- Toggle voice on/off at any time
- Skip speech by clicking the indicator or pressing ESC

### 📚 Educational Content
Learn real climate science concepts:
- Glacier temperature monitoring
- Ice core analysis and climate archives
- Satellite thermal imaging
- Scientific data verification methods
- Climate change impacts

### 💾 Save System
- Auto-save progress
- Multiple save slots
- Load previous investigations
- Continue from last session

### 📱 Responsive Design
- Works on desktop and mobile devices
- Touch-friendly interface
- Optimized for various screen sizes

---

## 🚀 Getting Started

### Requirements
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- JavaScript enabled
- Microphone (optional, for voice input)

### Installation

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Start playing!** No build process or server required

```bash
# If using git
git clone [repository-url]
cd chapter1_minimal

# Then open index.html in your browser
open index.html  # macOS
start index.html # Windows
```

---

## 🎯 How To Play

### Basic Commands

- **look** - Describe your surroundings
- **examine [object]** - Investigate something closely
  - Example: `examine monitoring station`
- **talk to maya** - Speak with Dr. Patel
- **inventory** - View collected evidence
- **progress** - Check investigation status
- **help** - Show all available commands

### Voice Input

1. Click the microphone button 🎤 or press the keyboard shortcut
2. Speak your command clearly
3. The game will process your input automatically

### Investigating

1. **Look around** to see what's available
2. **Examine objects** to find evidence
3. **Study evidence** to learn climate science concepts
4. **Talk to Maya** to get insights and ask questions
5. **Unlock the tablet** by answering security questions based on evidence

### Tablet Security System

Dr. Chen's encrypted field notes are protected by a security system. To unlock them:
- Find and examine all evidence items
- Answer 4 security questions based on the evidence
- Gain access to crucial information about her disappearance

---

## 🗂️ Project Structure

```
chapter1_minimal/
├── index.html              # Main game file
├── main.js                 # Game initialization
├── css/
│   ├── base.css           # Base styles and variables
│   ├── layout.css         # Layout and structure
│   ├── components.css     # UI components
│   ├── modals.css         # Modal dialogs
│   ├── animations.css     # Animations and transitions
│   └── responsive.css     # Mobile/tablet responsive design
├── js/
│   ├── core/              # Core game systems
│   │   ├── game-engine.js    # Main game logic
│   │   ├── ui-manager.js     # UI updates and display
│   │   ├── speech-manager.js # TTS/STT functionality
│   │   ├── save-manager.js   # Save/load system
│   │   └── menu-manager.js   # Menu screens
│   ├── chapters/          # Chapter-specific content
│   │   └── chapter1/
│   │       ├── chapter1-content.js  # All game data
│   │       └── chapter1-logic.js    # Chapter gameplay
│   └── shared/            # Shared utilities
│       └── game-state.js  # Game state management
└── README.md              # This file
```

---

## 🧩 Game Systems

### Evidence System
Discover and examine 5 pieces of scientific evidence:
- Temperature Monitoring Data
- Sensor Calibration Log
- Dr. Chen's Encrypted Field Notes
- Ice Core Sample
- Satellite Thermal Image

Each piece includes detailed information and educational climate science lessons.

### Dialogue System
- Natural language processing for player input
- Context-aware NPC responses
- Multiple conversation topics
- Evidence can be discussed with NPCs

### Progress Tracking
The game tracks:
- Evidence discovered and examined
- Locations visited
- NPCs talked to
- Concepts learned
- Tablet unlock progress

---

## 🎨 Customization

### Voice Settings

The game uses offline system voices by default. You can modify voice preferences in `js/core/speech-manager.js`:

```javascript
export const voices = {
    patel: { rate: 0.95, pitch: 1.1, volume: 1.0 },
    narrator: { rate: 1.0, pitch: 1.0, volume: 0.9 }
};
```

### Difficulty

To adjust the tablet security system difficulty, edit the tolerance values in `js/chapters/chapter1/chapter1-content.js`:

```javascript
answer: 2.3,
tolerance: 0.05,  // Increase for easier, decrease for harder
```

---

## 🌍 Educational Goals

This game teaches players about:

1. **Glacier Science**: How glaciers form, their structure, and why they matter
2. **Climate Monitoring**: Methods scientists use to track climate change
3. **Data Verification**: How scientists ensure their findings are accurate
4. **Remote Sensing**: Using satellites to monitor Earth's climate
5. **Climate Impacts**: Real-world effects of glacier melting

All science content is based on real climate research methods and current scientific understanding.

---

## 🔧 Technical Notes

### Browser Compatibility
- **Chrome/Edge**: Full support for all features
- **Firefox**: Full support for all features
- **Safari**: Full support for all features
- **Mobile browsers**: Voice input may have limited support

### Performance
- No external dependencies or frameworks
- Vanilla JavaScript (ES6 modules)
- Lightweight and fast-loading
- Works offline after initial load

### Accessibility
- Keyboard navigation supported
- Screen reader compatible text
- Voice narration for all content
- High contrast UI elements

---

## 🐛 Troubleshooting

### Voice Not Working
1. Click anywhere on the page to enable audio (browser autoplay policy)
2. Check that your volume is turned up
3. Ensure the mute button shows 🔊 (Voice On)

### Voice Input Not Working
1. Grant microphone permissions when prompted
2. Use a supported browser (Chrome, Edge, or Safari)
3. Check microphone settings in your OS

### Save Game Issues
1. Ensure cookies/local storage is enabled
2. Check browser privacy settings
3. Try clearing browser cache and reloading

---

## 📝 License

MIT - See [LICENSE](LICENSE.txt) file.

---

## 👏 Credits

**Game Design & Development**: Sigrid Benezra

**Voice Actors**:
- System TTS voices (offline)
- Narrator: Martha (en-GB)
- Dr. Patel: Lekha (hi-IN)

---

## 🚧 Future Chapters

This is Chapter 1 of a 5-chapter series that continues Dr. Sarah Chen's story:

**Chapter 1: "The Disappearance"** (Available Now)
- Glacier monitoring and ice core analysis
- The mystery begins at Polaris Base

**Chapter 2: "Hidden Depths"** (Coming Soon)
- Remote sensing and satellite monitoring
- Corporate interests in climate research
- New suspects and deeper mysteries

**Chapter 3: "Fracture Lines"** (Coming Soon)
- Industry influence on climate science
- Glacier tipping points and critical thresholds
- Complex character motivations revealed

**Chapter 4: "The Expedition"** (Coming Soon)
- Catastrophic glacier failure mechanics
- Internal warming vs surface conditions
- Real danger emerges

**Chapter 5: "The Truth Melts Free"** (Coming Soon)
- Complete resolution of the mystery
- Scientific integrity and climate communication
- Multiple endings based on your choices
- Call to action for real-world climate engagement

**Complete Story**: 4-6 hours of gameplay across all chapters, with meaningful choices, complex characters, and comprehensive climate science education.

Stay tuned for updates!

---

## 📧 Contact

- Email: [Piggy Harp Games](piggyharp-games@yahoo.com)
- GitHub: [sdbenezra](https://github.com/sdbenezra)
- Website: [Portfolio](https://sdbenezra.github.io/portfolio/)

---

## 🌟 Enjoy the Game!

Type `look` to begin your investigation at Polaris Base Research Station...

*What happened to Dr. Sarah Chen? The truth is frozen in the evidence.*
