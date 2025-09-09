// Main entry point for 3D Snakes & Ladders Game
console.log('🚀 [DEBUG] Starting module imports...');

import { Game } from './core/Game.js';
console.log('✅ [DEBUG] Game module imported');

import { UIManager } from './ui/UIManager.js';
console.log('✅ [DEBUG] UIManager module imported');

import { ErrorHandler } from './utils/ErrorHandler.js';
console.log('✅ [DEBUG] ErrorHandler module imported');

console.log('✅ [DEBUG] All modules imported successfully');

// Global game instance
let gameInstance = null;
let uiManager = null;

// Global rendering mode - Always 2D
window.RENDER_MODE = '2d';

// Initialize the application
async function initApp() {
    try {
        console.log('🚀 [DEBUG] Starting 3D Snakes & Ladders initialization...');
        console.log('🚀 [DEBUG] Timestamp:', new Date().toISOString());

        // Initialize error handling
        console.log('🚀 [DEBUG] Step 1: Initializing error handling...');
        ErrorHandler.init();
        console.log('✅ [DEBUG] ErrorHandler initialized successfully');

        // Check for required browser features (Canvas support)
        console.log('🚀 [DEBUG] Step 2: Checking browser support...');
        const supportCheck = checkBrowserSupport();
        if (!supportCheck.success) {
            console.error('❌ [DEBUG] Browser support check failed');
            throw new Error(supportCheck.message || 'Browser does not support required features');
        }

        console.log('✅ [DEBUG] Browser support check passed - using 2D mode');

        // Initialize UI Manager
        console.log('🚀 [DEBUG] Step 3: Initializing UI Manager...');
        uiManager = new UIManager();
        console.log('🚀 [DEBUG] UIManager instance created, calling init()...');
        await uiManager.init();
        console.log('✅ [DEBUG] UIManager initialized successfully');

        // Initialize Game
        console.log('🚀 [DEBUG] Step 4: Initializing Game...');
        gameInstance = new Game();
        console.log('🚀 [DEBUG] Game instance created, calling init()...');
        await gameInstance.init();
        console.log('✅ [DEBUG] Game initialized successfully');

        // Connect UI Manager with Game Instance
        console.log('🚀 [DEBUG] Step 5: Connecting UI Manager with Game Instance...');
        uiManager.setGameInstance(gameInstance);
        console.log('✅ [DEBUG] UI Manager connected to Game Instance');

        // Set up event listeners
        console.log('🚀 [DEBUG] Step 6: Setting up event listeners...');
        setupEventListeners();
        console.log('✅ [DEBUG] Event listeners set up');

        console.log('✅ [DEBUG] Game initialization completed successfully at:', new Date().toISOString());

    } catch (error) {
        console.error('❌ [DEBUG] Failed to initialize game at step:', error);
        console.error('❌ [DEBUG] Error details:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        ErrorHandler.showError(error.message);
    }
}

// Check browser support for required features (Canvas only)
function checkBrowserSupport() {
    console.log('🔍 [DEBUG] Checking browser support for 2D canvas...');

    // Check if game canvas exists
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.log('❌ [DEBUG] Game canvas element not found');
        return { success: false, message: 'Game canvas element not found in the DOM.' };
    }

    // Check if canvas 2D context is available
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('❌ [DEBUG] Canvas 2D context not available');
            return { success: false, message: 'Canvas 2D context not available.' };
        } else {
            console.log('✅ [DEBUG] Canvas 2D context available');
            return { success: true };
        }
    } catch (error) {
        console.log('❌ [DEBUG] Error accessing canvas 2D context:', error);
        return { success: false, message: 'Error accessing canvas 2D context: ' + error.message };
    }
}

// Set up global event listeners
function setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => {
        if (gameInstance) {
            gameInstance.onResize();
        }
    });

    // Handle visibility change (pause/resume)
    document.addEventListener('visibilitychange', () => {
        if (gameInstance) {
            if (document.hidden) {
                gameInstance.pause();
            } else {
                gameInstance.resume();
            }
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'Escape':
                if (uiManager) {
                    uiManager.showMainMenu();
                }
                break;
            case ' ':
                event.preventDefault();
                if (gameInstance && gameInstance.isActive) {
                    gameInstance.rollDice();
                }
                break;
        }
    });
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (gameInstance) {
        gameInstance.dispose();
    }
});

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for debugging (development only)
if (import.meta.env.DEV) {
    window.gameInstance = gameInstance;
    window.uiManager = uiManager;
}