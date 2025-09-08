import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { GameState } from '../game/GameState.js';
import { InputManager } from '../ui/InputManager.js';

/**
 * Main Game class that orchestrates the entire game
 */
export class Game {
    constructor() {
        this.sceneManager = null;
        this.gameState = null;
        this.inputManager = null;
        this.isInitialized = false;
        this.isActive = false;
        this.animationId = null;

        // Game configuration
        this.config = {
            boardSize: 10,
            totalSquares: 100,
            maxPlayers: 4,
            animationSpeed: 1.0
        };
    }

    /**
     * Initialize the game
     */
    async init() {
        try {
            console.log('🎮 [DEBUG] Initializing game core...');
            console.log('🎮 [DEBUG] Game config:', this.config);

            // Initialize Three.js scene
            console.log('🎮 [DEBUG] Step 1: Creating SceneManager...');
            this.sceneManager = new SceneManager();
            console.log('🎮 [DEBUG] SceneManager created, calling init()...');
            await this.sceneManager.init();
            console.log('✅ [DEBUG] SceneManager initialized successfully');

            // Initialize game state
            console.log('🎮 [DEBUG] Step 2: Creating GameState...');
            this.gameState = new GameState(this.config);
            console.log('🎮 [DEBUG] GameState created, calling init()...');
            this.gameState.init();
            console.log('✅ [DEBUG] GameState initialized successfully');

            // Initialize input management
            console.log('🎮 [DEBUG] Step 3: Creating InputManager...');
            this.inputManager = new InputManager(this);
            console.log('✅ [DEBUG] InputManager created');

            // Set up game loop
            console.log('🎮 [DEBUG] Step 4: Starting game loop...');
            this.startGameLoop();
            console.log('✅ [DEBUG] Game loop started');

            this.isInitialized = true;
            console.log('✅ [DEBUG] Game core initialization completed');

        } catch (error) {
            console.error('❌ [DEBUG] Failed to initialize game core:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Start the main game loop
     */
    startGameLoop() {
        const animate = (time) => {
            this.animationId = requestAnimationFrame(animate);

            // Update scene
            if (this.sceneManager) {
                this.sceneManager.update(time);
            }

            // Update game state
            if (this.gameState) {
                this.gameState.update(time);
            }

            // Render scene
            if (this.sceneManager) {
                this.sceneManager.render();
            }
        };

        animate(0);
    }

    /**
     * Start a new game
     */
    startGame(gameMode = 'single', playerCount = 1) {
        if (!this.isInitialized) {
            throw new Error('Game not initialized');
        }

        console.log(`🎯 Starting ${gameMode} game with ${playerCount} player(s)`);

        this.gameState.startGame(gameMode, playerCount);
        this.sceneManager.setupGameScene();
        this.isActive = true;

        // Emit game started event
        this.emit('gameStarted', { gameMode, playerCount });
    }

    /**
     * Roll the dice
     */
    rollDice() {
        if (!this.isActive || !this.gameState.canRollDice()) {
            return;
        }

        const diceValue = this.gameState.rollDice();
        console.log(`🎲 Rolled: ${diceValue}`);

        // Animate dice roll
        this.sceneManager.animateDiceRoll(diceValue);

        // Move player after animation
        setTimeout(() => {
            this.moveCurrentPlayer(diceValue);
        }, 1000);

        this.emit('diceRolled', { value: diceValue });
    }

    /**
     * Move the current player
     */
    async moveCurrentPlayer(steps) {
        const playerId = this.gameState.currentPlayer;
        const startPosition = this.gameState.getPlayerPosition(playerId);
        const endPosition = Math.min(startPosition + steps, this.config.totalSquares);

        // Animate movement
        await this.sceneManager.animatePlayerMovement(playerId, startPosition, endPosition);

        // Update game state
        this.gameState.movePlayer(playerId, steps);

        // Check for snakes/ladders
        const teleportPosition = this.gameState.checkTeleport(endPosition);
        if (teleportPosition !== endPosition) {
            // Animate teleport
            await this.sceneManager.animateTeleport(playerId, endPosition, teleportPosition);
            this.gameState.setPlayerPosition(playerId, teleportPosition);
        }

        // Check for win condition
        if (this.gameState.checkWinCondition()) {
            this.endGame();
        } else {
            // Switch to next player
            this.gameState.nextPlayer();
            this.emit('turnChanged', { playerId: this.gameState.currentPlayer });
        }
    }

    /**
     * End the current turn
     */
    endTurn() {
        if (!this.isActive) return;

        this.gameState.nextPlayer();
        this.emit('turnChanged', { playerId: this.gameState.currentPlayer });
    }

    /**
     * End the game
     */
    endGame() {
        this.isActive = false;
        const winner = this.gameState.getWinner();

        console.log(`🏆 Game ended! Winner: Player ${winner + 1}`);

        this.emit('gameEnded', { winner });
    }

    /**
     * Pause the game
     */
    pause() {
        if (this.sceneManager) {
            this.sceneManager.pause();
        }
        this.emit('gamePaused');
    }

    /**
     * Resume the game
     */
    resume() {
        if (this.sceneManager) {
            this.sceneManager.resume();
        }
        this.emit('gameResumed');
    }

    /**
     * Handle window resize
     */
    onResize() {
        if (this.sceneManager) {
            this.sceneManager.onResize();
        }
    }

    /**
     * Get current game state
     */
    getGameState() {
        return {
            isActive: this.isActive,
            currentPlayer: this.gameState?.currentPlayer,
            playerPositions: this.gameState?.playerPositions,
            gameMode: this.gameState?.gameMode,
            turnCount: this.gameState?.turnCount
        };
    }

    /**
     * Event system
     */
    addEventListener(event, callback) {
        if (!this.eventListeners) {
            this.eventListeners = new Map();
        }

        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }

        this.eventListeners.get(event).push(callback);
    }

    removeEventListener(event, callback) {
        if (this.eventListeners?.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners?.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        console.log('🧹 Disposing game resources...');

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.sceneManager) {
            this.sceneManager.dispose();
        }

        if (this.inputManager) {
            this.inputManager.dispose();
        }

        this.isInitialized = false;
        this.isActive = false;

        console.log('✅ Game resources disposed');
    }
}