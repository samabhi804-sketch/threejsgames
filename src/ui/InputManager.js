/**
 * Manages user input and interactions
 */
export class InputManager {
    constructor(gameInstance) {
        this.gameInstance = gameInstance;
        this.isEnabled = true;

        // Input state
        this.keys = new Set();
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Set()
        };

        // Touch state
        this.touches = new Map();
    }

    /**
     * Initialize input manager
     */
    init() {
        console.log('⌨️ Initializing input manager...');

        this.setupKeyboardListeners();
        this.setupMouseListeners();
        this.setupTouchListeners();

        console.log('✅ Input manager initialized');
    }

    /**
     * Set up keyboard event listeners
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            if (!this.isEnabled) return;

            this.keys.add(event.code);

            // Handle specific key presses
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (this.gameInstance && this.gameInstance.isActive) {
                        this.gameInstance.rollDice();
                    }
                    break;

                case 'Enter':
                    event.preventDefault();
                    if (this.gameInstance && this.gameInstance.isActive) {
                        this.gameInstance.endTurn();
                    }
                    break;

                case 'Escape':
                    event.preventDefault();
                    // Could show pause menu or main menu
                    break;

                case 'KeyR':
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        window.location.reload();
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys.delete(event.code);
        });
    }

    /**
     * Set up mouse event listeners
     */
    setupMouseListeners() {
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
        });

        document.addEventListener('mousedown', (event) => {
            this.mouse.buttons.add(event.button);
        });

        document.addEventListener('mouseup', (event) => {
            this.mouse.buttons.delete(event.button);
        });

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    /**
     * Set up touch event listeners
     */
    setupTouchListeners() {
        document.addEventListener('touchstart', (event) => {
            if (!this.isEnabled) return;

            Array.from(event.changedTouches).forEach(touch => {
                this.touches.set(touch.identifier, {
                    x: touch.clientX,
                    y: touch.clientY,
                    startX: touch.clientX,
                    startY: touch.clientY
                });
            });
        });

        document.addEventListener('touchmove', (event) => {
            Array.from(event.changedTouches).forEach(touch => {
                if (this.touches.has(touch.identifier)) {
                    const touchData = this.touches.get(touch.identifier);
                    touchData.x = touch.clientX;
                    touchData.y = touch.clientY;
                }
            });
        });

        document.addEventListener('touchend', (event) => {
            Array.from(event.changedTouches).forEach(touch => {
                if (this.touches.has(touch.identifier)) {
                    const touchData = this.touches.get(touch.identifier);

                    // Check if it was a tap (minimal movement)
                    const deltaX = Math.abs(touchData.x - touchData.startX);
                    const deltaY = Math.abs(touchData.y - touchData.startY);

                    if (deltaX < 10 && deltaY < 10) {
                        // Handle tap
                        this.handleTap(touchData.x, touchData.y);
                    }

                    this.touches.delete(touch.identifier);
                }
            });
        });
    }

    /**
     * Handle tap events
     */
    handleTap(x, y) {
        // Convert screen coordinates to game coordinates if needed
        // For now, this is a placeholder for future touch interactions
        console.log(`👆 Tap at (${x}, ${y})`);
    }

    /**
     * Check if a key is currently pressed
     */
    isKeyPressed(keyCode) {
        return this.keys.has(keyCode);
    }

    /**
     * Check if a mouse button is currently pressed
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttons.has(button);
    }

    /**
     * Get current mouse position
     */
    getMousePosition() {
        return { ...this.mouse };
    }

    /**
     * Enable input handling
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Disable input handling
     */
    disable() {
        this.isEnabled = false;
        this.keys.clear();
        this.mouse.buttons.clear();
        this.touches.clear();
    }

    /**
     * Update input manager (called every frame)
     */
    update(deltaTime) {
        // Handle continuous key presses
        if (this.isEnabled) {
            // Handle held keys for continuous actions
            if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('KeyA')) {
                // Camera pan left
            }

            if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('KeyD')) {
                // Camera pan right
            }

            if (this.isKeyPressed('ArrowUp') || this.isKeyPressed('KeyW')) {
                // Camera pan up
            }

            if (this.isKeyPressed('ArrowDown') || this.isKeyPressed('KeyS')) {
                // Camera pan down
            }
        }
    }

    /**
     * Dispose of input manager resources
     */
    dispose() {
        this.disable();
        console.log('⌨️ Input manager disposed');
    }
}