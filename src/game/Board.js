import { Tween } from '@tweenjs/tween.js';

/**
 * Manages the 2D game board creation and rendering
 */
export class Board {
    constructor() {
        this.pathPoints = [];

        // Board configuration
        this.config = {
            boardSize: 10,
            tileSize: 50,
            canvasWidth: 800,
            canvasHeight: 600
        };

        // Snakes and ladders data
        this.snakes = new Map([
            [27, 5], [40, 3], [54, 31], [66, 45],
            [76, 58], [89, 53], [99, 41]
        ]);

        this.ladders = new Map([
            [2, 23], [8, 34], [20, 41], [32, 51],
            [41, 79], [74, 92]
        ]);
    }

    /**
     * Initialize the board
     */
    async init(scene) {
        console.log('📋 Initializing 2D game board...');
        this.generatePathPoints();
        console.log('✅ 2D Board initialized');
    }

    /**
     * Get square number based on zigzag pattern
     */
    getSquareNumber(row, col) {
        if (row % 2 === 0) {
            // Even rows: left to right (1-10, 21-30, etc.)
            return row * 10 + col + 1;
        } else {
            // Odd rows: right to left (11-20, 31-40, etc.)
            return row * 10 + (9 - col) + 1;
        }
    }

    /**
     * Generate the path points for the boustrophedon pattern
     */
    generatePathPoints() {
        this.pathPoints = [];
        const { boardSize, tileSize, canvasWidth, canvasHeight } = this.config;

        // Calculate board offset to center it
        const boardWidth = boardSize * tileSize;
        const boardHeight = boardSize * tileSize;
        const offsetX = (canvasWidth - boardWidth) / 2;
        const offsetY = (canvasHeight - boardHeight) / 2;

        for (let row = 0; row < boardSize; row++) {
            if (row % 2 === 0) {
                // Left to right
                for (let col = 0; col < boardSize; col++) {
                    this.pathPoints.push({
                        x: offsetX + col * tileSize + tileSize / 2,
                        y: offsetY + row * tileSize + tileSize / 2,
                        number: this.getSquareNumber(row, col)
                    });
                }
            } else {
                // Right to left
                for (let col = boardSize - 1; col >= 0; col--) {
                    this.pathPoints.push({
                        x: offsetX + col * tileSize + tileSize / 2,
                        y: offsetY + row * tileSize + tileSize / 2,
                        number: this.getSquareNumber(row, col)
                    });
                }
            }
        }
    }

    /**
     * Get path points
     */
    getPathPoints() {
        return this.pathPoints;
    }

    /**
     * Get position coordinates
     */
    getPositionCoordinates(position) {
        if (position < 1 || position > this.pathPoints.length) {
            return null;
        }
        return this.pathPoints[position - 1];
    }

    /**
     * Update board (called every frame)
     */
    update(deltaTime) {
        // Update any animated elements here
        // For now, this is a placeholder
    }

    /**
     * Render 2D board
     */
    render2D(ctx) {
        if (!ctx) return;

        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height / 2;
        const boardSize = 400; // 2D board size
        const tileSize = boardSize / this.config.boardSize;

        // Draw board background
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(centerX - boardSize/2, centerY - boardSize/2, boardSize, boardSize);

        // Draw tiles with numbers
        for (let row = 0; row < this.config.boardSize; row++) {
            for (let col = 0; col < this.config.boardSize; col++) {
                const x = centerX - boardSize/2 + col * tileSize;
                const y = centerY - boardSize/2 + row * tileSize;
                const squareNumber = this.getSquareNumber(row, col);

                // Use special colors for start and finish squares
                let tileColor;
                if (squareNumber === 1) {
                    tileColor = '#f1c40f'; // Start square (yellow)
                } else if (squareNumber === 100) {
                    tileColor = '#e67e22'; // Finish square (orange)
                } else {
                    // Alternate tile colors
                    tileColor = (row + col) % 2 === 0 ? '#34495e' : '#2c3e50';
                }

                ctx.fillStyle = tileColor;
                ctx.fillRect(x, y, tileSize, tileSize);

                // Draw tile border
                ctx.strokeStyle = '#445566';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, tileSize, tileSize);

                // Draw square number
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(squareNumber.toString(), x + tileSize/2, y + tileSize/2);
            }
        }

        // Draw path
        this.render2DPath(ctx, centerX, centerY, boardSize, tileSize);

        // Draw snakes and ladders
        this.render2DSnakesAndLadders(ctx, centerX, centerY, boardSize, tileSize);
    }

    /**
     * Render 2D path
     */
    render2DPath(ctx, centerX, centerY, boardSize, tileSize) {
        ctx.strokeStyle = '#1abc9c';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.pathPoints.forEach((point, index) => {
            const x = centerX - boardSize/2 + point.x;
            const y = centerY - boardSize/2 + point.y;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    /**
     * Render 2D snakes and ladders
     */
    render2DSnakesAndLadders(ctx, centerX, centerY, boardSize, tileSize) {
        // Draw snakes
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 4;
        for (const [from, to] of this.snakes) {
            this.draw2DConnection(ctx, centerX, centerY, boardSize, tileSize, from, to, '#e74c3c');
        }

        // Draw ladders
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 4;
        for (const [from, to] of this.ladders) {
            this.draw2DConnection(ctx, centerX, centerY, boardSize, tileSize, from, to, '#27ae60');
        }
    }

    /**
     * Draw 2D connection line
     */
    draw2DConnection(ctx, centerX, centerY, boardSize, tileSize, from, to, color) {
        const fromPoint = this.pathPoints[from - 1];
        const toPoint = this.pathPoints[to - 1];

        if (!fromPoint || !toPoint) return;

        const fromX = centerX - boardSize/2 + fromPoint.x;
        const fromY = centerY - boardSize/2 + fromPoint.y;
        const toX = centerX - boardSize/2 + toPoint.x;
        const toY = centerY - boardSize/2 + toPoint.y;

        // Draw curved line
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();

        // Create a simple curve
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2 - 20; // Curve upward

        ctx.moveTo(fromX, fromY);
        ctx.quadraticCurveTo(midX, midY, toX, toY);
        ctx.stroke();

        // Draw arrow head
        this.drawArrowHead(ctx, fromX, fromY, toX, toY, color);
    }

    /**
     * Draw arrow head
     */
    drawArrowHead(ctx, fromX, fromY, toX, toY, color) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Dispose of board resources
     */
    dispose() {
        // 2D board doesn't need special disposal
        this.pathPoints = [];
    }





    /**
     * Dispose of board resources
     */
    dispose() {
        // 2D board doesn't need special disposal
        this.pathPoints = [];
    }
}