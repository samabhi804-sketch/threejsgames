/**
 * Manages UI interactions, overlays, and user interface state
 */
export class UIManager {
    constructor() {
        this.gameInstance = null;
        this.currentScreen = 'loading';
        this.screens = {};
        this.eventListeners = {};

        // UI state
        this.isInitialized = false;
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            cameraFollow: true
        };
    }

    /**
     * Initialize the UI manager
     */
    async init() {
        console.log('🖥️ [DEBUG] Initializing UI manager...');
        console.log('🖥️ [DEBUG] Current screen:', this.currentScreen);

        console.log('🖥️ [DEBUG] Step 1: Loading settings...');
        this.loadSettings();
        console.log('✅ [DEBUG] Settings loaded');

        console.log('🖥️ [DEBUG] Step 2: Caching screen elements...');
        this.cacheScreenElements();
        console.log('✅ [DEBUG] Screen elements cached');

        console.log('🖥️ [DEBUG] Step 3: Setting up event listeners...');
        this.setupEventListeners();
        console.log('✅ [DEBUG] Event listeners set up');

        // Ensure loading screen is visible initially
        console.log('🖥️ [DEBUG] Step 4: Ensuring loading screen visibility...');
        if (this.screens.loading) {
            this.screens.loading.classList.remove('hidden');
            console.log('✅ [DEBUG] Loading screen is visible');
        } else {
            console.error('❌ [DEBUG] Loading screen element not found!');
        }

        // Small delay to ensure DOM is ready
        console.log('🖥️ [DEBUG] Step 5: Waiting for DOM ready...');
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ [DEBUG] DOM ready delay completed');

        console.log('🖥️ [DEBUG] Step 6: Switching to main-menu screen...');
        this.showScreen('main-menu');
        console.log('✅ [DEBUG] Screen switch initiated');

        this.isInitialized = true;
        console.log('✅ [DEBUG] UI manager initialization completed');
    }

    /**
     * Cache screen elements for quick access
     */
    cacheScreenElements() {
        console.log('🔍 Caching screen elements...');

        // Main screens
        this.screens = {
            loading: document.getElementById('loading-screen'),
            mainMenu: document.getElementById('main-menu'),
            game: document.getElementById('game-hud'),
            gameOver: document.getElementById('game-over-screen'),
            settings: document.getElementById('settings-panel'),
            error: document.getElementById('error-screen')
        };

        // Debug: Check if screens were found
        Object.entries(this.screens).forEach(([name, element]) => {
            if (element) {
                console.log(`✅ Found screen: ${name}`);
            } else {
                console.error(`❌ Screen not found: ${name}`);
            }
        });

        // Game HUD elements
        this.hud = {
            currentPlayer: document.getElementById('current-player'),
            diceValue: document.getElementById('dice-value'),
            turnNumber: document.getElementById('turn-number'),
            rollButton: document.getElementById('roll-dice-btn'),
            endTurnButton: document.getElementById('end-turn-btn'),
            leaderboard: document.getElementById('leaderboard-list')
        };

        // Menu buttons
        this.buttons = {
            singlePlayer: document.getElementById('single-player-btn'),
            localMultiplayer: document.getElementById('local-multiplayer-btn'),
            onlineMultiplayer: document.getElementById('online-multiplayer-btn'),
            playAgain: document.getElementById('play-again-btn'),
            mainMenu: document.getElementById('main-menu-btn'),
            settings: document.getElementById('settings-btn'),
            about: document.getElementById('about-btn'),
            saveSettings: document.getElementById('save-settings-btn'),
            closeSettings: document.getElementById('close-settings-btn'),
            retry: document.getElementById('retry-btn'),
            reload: document.getElementById('reload-btn')
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Menu buttons
        if (this.buttons.singlePlayer) {
            this.buttons.singlePlayer.addEventListener('click', () => this.startGame('single', 1));
        }

        if (this.buttons.localMultiplayer) {
            this.buttons.localMultiplayer.addEventListener('click', () => this.startGame('local', 2));
        }

        if (this.buttons.onlineMultiplayer) {
            this.buttons.onlineMultiplayer.addEventListener('click', () => this.showOnlineMenu());
        }

        // Game buttons
        if (this.hud.rollButton) {
            this.hud.rollButton.addEventListener('click', () => this.rollDice());
        }

        if (this.hud.endTurnButton) {
            this.hud.endTurnButton.addEventListener('click', () => this.endTurn());
        }

        // Other buttons
        if (this.buttons.settings) {
            this.buttons.settings.addEventListener('click', () => this.showSettings());
        }

        if (this.buttons.about) {
            this.buttons.about.addEventListener('click', () => this.showAbout());
        }

        if (this.buttons.saveSettings) {
            this.buttons.saveSettings.addEventListener('click', () => this.saveSettings());
        }

        if (this.buttons.closeSettings) {
            this.buttons.closeSettings.addEventListener('click', () => this.hideSettings());
        }

        if (this.buttons.playAgain) {
            this.buttons.playAgain.addEventListener('click', () => this.playAgain());
        }

        if (this.buttons.mainMenu) {
            this.buttons.mainMenu.addEventListener('click', () => this.showMainMenu());
        }

        if (this.buttons.retry) {
            this.buttons.retry.addEventListener('click', () => window.location.reload());
        }

        if (this.buttons.reload) {
            this.buttons.reload.addEventListener('click', () => window.location.reload());
        }

        // Settings checkboxes
        this.setupSettingsListeners();
    }

    /**
     * Set up settings event listeners
     */
    setupSettingsListeners() {
        const soundCheckbox = document.getElementById('sound-enabled');
        const musicCheckbox = document.getElementById('music-enabled');
        const cameraCheckbox = document.getElementById('camera-follow');

        if (soundCheckbox) {
            soundCheckbox.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
            });
        }

        if (musicCheckbox) {
            musicCheckbox.addEventListener('change', (e) => {
                this.settings.musicEnabled = e.target.checked;
            });
        }

        if (cameraCheckbox) {
            cameraCheckbox.addEventListener('change', (e) => {
                this.settings.cameraFollow = e.target.checked;
            });
        }
    }

    /**
     * Show a specific screen
     */
    showScreen(screenName) {
        console.log(`🖥️ [DEBUG] Switching to screen: ${screenName}`);
        console.log(`🖥️ [DEBUG] Current screen before switch:`, this.currentScreen);
        console.log(`🖥️ [DEBUG] Available screens:`, Object.keys(this.screens));

        // Hide all screens
        console.log(`🖥️ [DEBUG] Hiding all screens...`);
        Object.entries(this.screens).forEach(([name, screen]) => {
            if (screen) {
                screen.classList.add('hidden');
                console.log(`🖥️ [DEBUG] Hidden screen: ${name}`);
            } else {
                console.warn(`🖥️ [DEBUG] Screen element not found: ${name}`);
            }
        });

        // Show target screen
        const targetScreen = this.screens[screenName];
        if (targetScreen) {
            console.log(`🖥️ [DEBUG] Found target screen element:`, targetScreen);
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenName;
            console.log(`✅ [DEBUG] Screen ${screenName} is now visible`);
            console.log(`✅ [DEBUG] Current screen after switch:`, this.currentScreen);
        } else {
            console.error(`❌ [DEBUG] Screen ${screenName} not found in screens object`);
            console.error(`❌ [DEBUG] Available screens:`, Object.keys(this.screens));
        }
    }

    /**
     * Start a new game
     */
    startGame(gameMode, playerCount) {
        if (!this.gameInstance) {
            console.error('Game instance not available');
            return;
        }

        console.log(`🎮 Starting ${gameMode} game with ${playerCount} players`);
        this.gameInstance.startGame(gameMode, playerCount);
        this.showScreen('game');
        this.updateGameUI();
    }

    /**
     * Show online multiplayer menu
     */
    showOnlineMenu() {
        // For now, show an alert - online multiplayer would need server implementation
        alert('Online multiplayer coming soon! Try local multiplayer for now.');
    }

    /**
     * Roll the dice
     */
    rollDice() {
        if (!this.gameInstance) return;

        this.gameInstance.rollDice();
        this.updateGameUI();
    }

    /**
     * End the current turn
     */
    endTurn() {
        if (!this.gameInstance) return;

        this.gameInstance.endTurn();
        this.updateGameUI();
    }

    /**
     * Update game UI elements
     */
    updateGameUI() {
        if (!this.gameInstance) return;

        const gameState = this.gameInstance.getGameState();

        // Update current player
        if (this.hud.currentPlayer) {
            this.hud.currentPlayer.textContent = `Player: ${gameState.currentPlayer + 1}`;
        }

        // Update turn number
        if (this.hud.turnNumber) {
            this.hud.turnNumber.textContent = gameState.turnCount;
        }

        // Update button states
        if (this.hud.rollButton) {
            this.hud.rollButton.disabled = !gameState.isActive;
        }

        if (this.hud.endTurnButton) {
            this.hud.endTurnButton.disabled = !gameState.isActive;
        }
    }

    /**
     * Update dice display
     */
    updateDice(value) {
        if (this.hud.diceValue) {
            this.hud.diceValue.textContent = value;
        }
    }

    /**
     * Show main menu
     */
    showMainMenu() {
        this.showScreen('main-menu');
    }

    /**
     * Show settings panel
     */
    showSettings() {
        // Load current settings into checkboxes
        const soundCheckbox = document.getElementById('sound-enabled');
        const musicCheckbox = document.getElementById('music-enabled');
        const cameraCheckbox = document.getElementById('camera-follow');

        if (soundCheckbox) soundCheckbox.checked = this.settings.soundEnabled;
        if (musicCheckbox) musicCheckbox.checked = this.settings.musicEnabled;
        if (cameraCheckbox) cameraCheckbox.checked = this.settings.cameraFollow;

        this.screens.settings.classList.remove('hidden');
    }

    /**
     * Hide settings panel
     */
    hideSettings() {
        this.screens.settings.classList.add('hidden');
    }

    /**
     * Save settings
     */
    saveSettings() {
        this.saveSettingsToStorage();
        this.hideSettings();
        console.log('⚙️ Settings saved');
    }

    /**
     * Show about dialog
     */
    showAbout() {
        alert('3D Snakes & Ladders\n\nA modern web-based board game built with Three.js.\n\nFeatures:\n• 3D board with snakes and ladders\n• Multiple game modes\n• Responsive design\n• PWA support');
    }

    /**
     * Play again
     */
    playAgain() {
        if (!this.gameInstance) return;

        // Get current game mode and player count
        const gameState = this.gameInstance.getGameState();
        this.startGame(gameState.gameMode, gameState.playerCount);
    }

    /**
     * Show game over screen
     */
    showGameOver(winner, stats) {
        this.showScreen('game-over');

        // Update winner display
        const winnerElement = document.getElementById('winner-name');
        if (winnerElement) {
            winnerElement.textContent = `Player ${winner + 1}`;
        }

        // Update statistics
        const turnElement = document.getElementById('total-turns');
        const snakesElement = document.getElementById('snakes-hit');
        const laddersElement = document.getElementById('ladders-climbed');

        if (turnElement) turnElement.textContent = stats.turnCount || 0;
        if (snakesElement) snakesElement.textContent = stats.snakesHit || 0;
        if (laddersElement) laddersElement.textContent = stats.laddersClimbed || 0;
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('snakes-ladders-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettingsToStorage() {
        try {
            localStorage.setItem('snakes-ladders-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    /**
     * Set game instance reference
     */
    setGameInstance(gameInstance) {
        this.gameInstance = gameInstance;

        // Set up game event listeners
        if (gameInstance) {
            gameInstance.addEventListener('diceRolled', (data) => {
                this.updateDice(data.value);
            });

            gameInstance.addEventListener('turnChanged', (data) => {
                this.updateGameUI();
            });

            gameInstance.addEventListener('gameEnded', (data) => {
                const stats = gameInstance.gameState?.getStatistics();
                this.showGameOver(data.winner, stats);
            });
        }
    }

    /**
     * Show error screen
     */
    showError(message) {
        this.showScreen('error');

        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    /**
     * Dispose of UI resources
     */
    dispose() {
        // Clean up event listeners if needed
        this.isInitialized = false;
    }
}