/**
 * Chapter Interface
 *
 * Defines the contract that all chapter modules must implement.
 * This ensures consistency across all chapters and makes it easy
 * to add new chapters to the game.
 *
 * All chapters must extend this class and implement all methods.
 */

export class ChapterInterface {
    /**
     * Get the chapter number
     * @returns {number} Chapter number (1, 2, 3, etc.)
     */
    static get chapterNumber() {
        throw new Error('Chapter must implement static getter: chapterNumber');
    }

    /**
     * Get the chapter title
     * @returns {string} Chapter title
     */
    static get chapterTitle() {
        throw new Error('Chapter must implement static getter: chapterTitle');
    }

    /**
     * Initialize the chapter
     * Sets up chapter-specific data in gameState
     */
    static initializeChapter() {
        throw new Error('Chapter must implement static method: initializeChapter()');
    }

    /**
     * Show the chapter introduction
     * Displays the opening narrative/story
     */
    static showIntro() {
        throw new Error('Chapter must implement static method: showIntro()');
    }

    /**
     * Show the current location description
     * Describes where the player is and what they can do
     */
    static showLocation() {
        throw new Error('Chapter must implement static method: showLocation()');
    }

    /**
     * Get the chapter's interaction points
     * @returns {Object} Object containing all interaction points
     */
    static getInteractionPoints() {
        throw new Error('Chapter must implement static method: getInteractionPoints()');
    }

    /**
     * Get the chapter's evidence items
     * @returns {Object} Object containing all evidence
     */
    static getEvidence() {
        throw new Error('Chapter must implement static method: getEvidence()');
    }

    /**
     * Handle NPC dialogue
     * @param {string} npc - NPC identifier (e.g., 'maya')
     * @param {string} topic - Topic or keyword for the dialogue
     * @returns {string} The NPC's response
     */
    static handleNPCDialogue(npc, topic) {
        throw new Error('Chapter must implement static method: handleNPCDialogue(npc, topic)');
    }

    /**
     * Check if the chapter is complete
     * @returns {boolean} True if chapter completion conditions are met
     */
    static checkChapterCompletion() {
        throw new Error('Chapter must implement static method: checkChapterCompletion()');
    }

    /**
     * Trigger the chapter ending sequence
     */
    static triggerChapterEnding() {
        throw new Error('Chapter must implement static method: triggerChapterEnding()');
    }
}
