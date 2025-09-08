/**
 * Manages the game state, rules, and logic
 */
export class GameState {
    constructor(config) {
        this.config = config;

        // Game state
        this.gameMode = null;
        this.playerCount = 0;
        this.currentPlayer = 0;
        this.playerPositions = [];
        this.playerNames = [];
        this.turnCount = 0;
        this.gameStartTime = null;
        this.gameEndTime = null;
        this.winner = null;

        // Game rules
        this.snakes = new Map([
            [27, 5], [40, 3], [54, 31], [66, 45],
            [76, 58], [89, 53], [99, 41]
        ]);

        this.ladders = new Map([
            [2, 23], [8, 34], [20, 41], [32, 51],
            [41, 79], [74, 92]
        ]);

        // Statistics
        this.stats = {
            snakesHit: 0,
            laddersClimbed: 0,
            longestTurn: 0,
            shortestTurn: Infinity
        };
    }

    /**
     * Initialize the game state
     */
    init() {
        console.log('📊 Initializing game state...');
        this.reset();
    }

    /**
     * Reset the game state
     */
    reset() {
        this.gameMode = null;
        this.playerCount = 0;
        this.currentPlayer = 0;
        this.playerPositions = [];
        this.playerNames = [];
        this.turnCount = 0;
        this.gameStartTime = null;
        this.gameEndTime = null;
        this.winner = null;

        // Reset statistics
        this.stats = {
            snakesHit: 0,
            laddersHit: 0,
            laddersClimbed: 0,
            longestTurn: 0,
            shortestTurn: Infinity,
            totalDiceRolls: 0,
            diceDistribution: new Array(6).fill(0)
        };
    }

    /**
     * Start a new game
     */
    startGame(gameMode, playerCount) {
        console.log(`🎮 Starting ${gameMode} game with ${playerCount} players`);

        this.reset();
        this.gameMode = gameMode;
        this.playerCount = playerCount;
        this.gameStartTime = Date.now();

        // Initialize players
        this.playerPositions = new Array(playerCount).fill(1); // Start at position 1
        this.playerNames = [];
        for (let i = 0; i < playerCount; i++) {
            this.playerNames.push(`Player ${i + 1}`);
        }

        this.currentPlayer = 0;
        this.turnCount = 1;
    }

    /**
     * Roll the dice
     */
    rollDice() {
        if (!this.isGameActive()) {
            throw new Error('Game is not active');
        }

        const value = Math.floor(Math.random() * 6) + 1;

        // Update statistics
        this.stats.totalDiceRolls++;
        this.stats.diceDistribution[value - 1]++;

        return value;
    }

    /**
     * Check if dice can be rolled
     */
    canRollDice() {
        return this.isGameActive() && !this.isAnimating();
    }

    /**
     * Move a player
     */
    movePlayer(playerId, steps) {
        if (!this.isValidPlayer(playerId)) {
            throw new Error(`Invalid player ID: ${playerId}`);
        }

        const currentPosition = this.playerPositions[playerId];
        let newPosition = currentPosition + steps;

        // Bounce back rule
        if (newPosition > this.config.totalSquares) {
            const overshoot = newPosition - this.config.totalSquares;
            newPosition = this.config.totalSquares - overshoot;
        }

        // Ensure position is within bounds
        newPosition = Math.max(1, Math.min(this.config.totalSquares, newPosition));

        // Check for teleport
        const teleportPosition = this.checkTeleport(newPosition);
        if (teleportPosition !== newPosition) {
            // Update statistics
            if (this.snakes.has(newPosition)) {
                this.stats.snakesHit++;
            } else if (this.ladders.has(newPosition)) {
                this.stats.laddersClimbed++;
            }

            newPosition = teleportPosition;
        }

        this.playerPositions[playerId] = newPosition;

        // Update turn statistics
        const turnLength = steps;
        this.stats.longestTurn = Math.max(this.stats.longestTurn, turnLength);
        this.stats.shortestTurn = Math.min(this.stats.shortestTurn, turnLength);

        return newPosition;
    }

    /**
     * Check for snake or ladder at position
     */
    checkTeleport(position) {
        return this.snakes.get(position) || this.ladders.get(position) || position;
    }

    /**
     * Set player position directly (for teleports)
     */
    setPlayerPosition(playerId, position) {
        if (!this.isValidPlayer(playerId)) {
            throw new Error(`Invalid player ID: ${playerId}`);
        }

        this.playerPositions[playerId] = Math.max(1, Math.min(this.config.totalSquares, position));
    }

    /**
     * Get player position
     */
    getPlayerPosition(playerId) {
        if (!this.isValidPlayer(playerId)) {
            throw new Error(`Invalid player ID: ${playerId}`);
        }

        return this.playerPositions[playerId];
    }

    /**
     * Move to next player
     */
    nextPlayer() {
        this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
        this.turnCount++;
    }

    /**
     * Check win condition
     */
    checkWinCondition() {
        return this.playerPositions[this.currentPlayer] === this.config.totalSquares;
    }

    /**
     * End the game
     */
    endGame() {
        this.gameEndTime = Date.now();
        this.winner = this.currentPlayer;
    }

    /**
     * Get winner information
     */
    getWinner() {
        return this.winner;
    }

    /**
     * Check if game is active
     */
    isGameActive() {
        return this.gameMode !== null && this.gameEndTime === null;
    }

    /**
     * Check if game is over
     */
    isGameOver() {
        return this.gameEndTime !== null;
    }

    /**
     * Check if currently animating (placeholder for future animation state)
     */
    isAnimating() {
        // This would be true during animations
        return false;
    }

    /**
     * Validate player ID
     */
    isValidPlayer(playerId) {
        return playerId >= 0 && playerId < this.playerCount;
    }

    /**
     * Get game duration
     */
    getGameDuration() {
        if (!this.gameStartTime) return 0;

        const endTime = this.gameEndTime || Date.now();
        return endTime - this.gameStartTime;
    }

    /**
     * Get game statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            gameDuration: this.getGameDuration(),
            turnCount: this.turnCount,
            winner: this.winner,
            playerCount: this.playerCount,
            gameMode: this.gameMode
        };
    }

    /**
     * Get current game state
     */
    getState() {
        return {
            gameMode: this.gameMode,
            playerCount: this.playerCount,
            currentPlayer: this.currentPlayer,
            playerPositions: [...this.playerPositions],
            playerNames: [...this.playerNames],
            turnCount: this.turnCount,
            isGameActive: this.isGameActive(),
            isGameOver: this.isGameOver(),
            winner: this.winner,
            gameDuration: this.getGameDuration()
        };
    }

    /**
     * Update game state (called every frame)
     */
    update(deltaTime) {
        // Update any time-based game logic here
        // For now, this is a placeholder for future features
    }

    /**
     * Export game state for saving
     */
    exportState() {
        return {
            ...this.getState(),
            stats: this.getStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Import game state for loading
     */
    importState(state) {
        // This would be used for save/load functionality
        console.log('Importing game state:', state);
        // Implementation would restore all state properties
    }
}