import { Board } from '../game/Board.js';
import { PlayerManager } from '../game/PlayerManager.js';

/**
 * Manages the 2D canvas scene and game objects
 */
export class SceneManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.board = null;
        this.playerManager = null;
        this.isPaused = false;
        this.animationId = null;

        // Canvas configuration
        this.config = {
            backgroundColor: '#0a0a0e',
            width: 800,
            height: 600
        };
    }

    /**
     * Initialize the 2D canvas scene
     */
    async init() {
        try {
            console.log('🎨 [DEBUG] Initializing 2D canvas scene...');

            console.log('🎨 [DEBUG] Step 1: Setting up canvas...');
            this.setupCanvas();
            console.log('✅ [DEBUG] Canvas set up');

            console.log('🎨 [DEBUG] Step 2: Creating Board...');
            this.board = new Board();
            console.log('🎨 [DEBUG] Board created, calling init()...');
            await this.board.init(null); // No scene needed for 2D
            console.log('✅ [DEBUG] Board initialized');

            console.log('🎨 [DEBUG] Step 3: Creating PlayerManager...');
            this.playerManager = new PlayerManager();
            console.log('🎨 [DEBUG] PlayerManager created, calling init()...');
            await this.playerManager.init(null); // No scene needed for 2D
            console.log('✅ [DEBUG] PlayerManager initialized');

            // Handle window resize
            console.log('🎨 [DEBUG] Step 4: Setting up resize listener...');
            window.addEventListener('resize', () => this.onResize());
            console.log('✅ [DEBUG] Resize listener set up');

            // Start render loop
            console.log('🎨 [DEBUG] Step 5: Starting render loop...');
            this.startRenderLoop();
            console.log('✅ [DEBUG] Render loop started');

            console.log('✅ [DEBUG] 2D canvas scene initialization completed');

        } catch (error) {
            console.error('❌ [DEBUG] Failed to initialize 2D canvas scene:', error);
            throw error;
        }
    }

    /**
     * Set up the canvas for 2D rendering
     */
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas element not found');
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Canvas 2D context not available');
        }

        // Set canvas size
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;

        console.log('✅ [DEBUG] Canvas set up:', this.canvas.width, 'x', this.canvas.height);
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        const render = () => {
            if (!this.isPaused) {
                this.render();
            }
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }

    /**
     * Render the 2D scene
     */
    render() {
        if (!this.ctx) return;

        // Clear canvas
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render game objects
        if (this.board) {
            this.board.render2D(this.ctx);
        }

        if (this.playerManager) {
            this.playerManager.render2D(this.ctx);
        }
    }

    /**
     * Set up the game scene
     */
    setupGameScene() {
        if (this.board) {
            // Board is ready for 2D rendering
            console.log('✅ [DEBUG] 2D Board ready');
        }

        if (this.playerManager) {
            this.playerManager.createPlayers(4); // Default to 4 players
            console.log('✅ [DEBUG] 2D Players created');
        }
    }

    /**
     * Handle window resize
     */
    onResize() {
        if (!this.canvas || !this.ctx) return;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Pause scene updates
     */
    pause() {
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Resume scene updates
     */
    resume() {
        this.isPaused = false;
        if (!this.animationId) {
            this.startRenderLoop();
        }
    }

    /**
     * Clean up resources
     */
    dispose() {
        console.log('🧹 Disposing 2D scene resources...');

        this.pause();
        this.canvas = null;
        this.ctx = null;
        this.board = null;
        this.playerManager = null;

        console.log('✅ 2D scene resources disposed');
    }
}