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

// Initialize the application
async function initApp() {
    try {
        console.log('🚀 [DEBUG] Starting 3D Snakes & Ladders initialization...');
        console.log('🚀 [DEBUG] Timestamp:', new Date().toISOString());

        // Initialize error handling
        console.log('🚀 [DEBUG] Step 1: Initializing error handling...');
        ErrorHandler.init();
        console.log('✅ [DEBUG] ErrorHandler initialized successfully');

        // Check for required browser features
        console.log('🚀 [DEBUG] Step 2: Checking browser support...');
        if (!checkBrowserSupport()) {
            console.error('❌ [DEBUG] Browser support check failed');
            throw new Error('Browser does not support required features');
        }
        console.log('✅ [DEBUG] Browser support check passed');

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

// Check browser support for required features
function checkBrowserSupport() {
    console.log('🔍 [DEBUG] Checking browser support for required features...');

    const requiredFeatures = [
        'WebGLRenderingContext',
        'Canvas',
        'Promise',
        'Map',
        'Set',
        'requestAnimationFrame'
    ];

    // Check each feature
    for (const feature of requiredFeatures) {
        console.log(`🔍 [DEBUG] Checking feature: ${feature}`);

        if (feature === 'WebGLRenderingContext') {
            // Special check for WebGL
            console.log(`🔍 [DEBUG] Testing WebGL support...`);
            const canvas = document.createElement('canvas');
            console.log(`🔍 [DEBUG] Created test canvas:`, canvas);

            let gl = null;
            try {
                gl = canvas.getContext('webgl');
                console.log(`🔍 [DEBUG] WebGL context:`, gl ? 'obtained' : 'failed');
            } catch (error) {
                console.error(`❌ [DEBUG] Error getting WebGL context:`, error);
            }

            if (!gl) {
                try {
                    gl = canvas.getContext('experimental-webgl');
                    console.log(`🔍 [DEBUG] Experimental WebGL context:`, gl ? 'obtained' : 'failed');
                } catch (error) {
                    console.error(`❌ [DEBUG] Error getting experimental WebGL context:`, error);
                }
            }

            if (!gl) {
                console.error(`❌ [DEBUG] WebGL not supported!`);
                console.error(`❌ [DEBUG] Browser info:`, {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    cookieEnabled: navigator.cookieEnabled,
                    onLine: navigator.onLine
                });
                return false;
            }

            console.log(`✅ [DEBUG] WebGL supported, context:`, gl.constructor.name);
            console.log(`🔍 [DEBUG] WebGL info:`, {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
            });
        } else if (typeof window[feature] === 'undefined') {
            console.error(`❌ [DEBUG] Feature not supported: ${feature}`);
            console.error(`❌ [DEBUG] window.${feature}:`, window[feature]);
            return false;
        } else {
            console.log(`✅ [DEBUG] Feature supported: ${feature}`);
        }
    }

    // Additional WebGL check
    try {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error(`❌ [DEBUG] Canvas element not found!`);
            return false;
        }
        console.log(`✅ [DEBUG] Canvas element found:`, canvas);

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
            console.error(`❌ [DEBUG] Cannot get WebGL context from canvas!`);
            return false;
        }
        console.log(`✅ [DEBUG] WebGL context from canvas obtained:`, gl.constructor.name);
    } catch (error) {
        console.error(`❌ [DEBUG] Error checking canvas WebGL:`, error);
        return false;
    }

    console.log('✅ [DEBUG] All browser support checks passed');
    return true;
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