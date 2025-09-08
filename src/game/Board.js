import * as THREE from 'three';

/**
 * Manages the 3D game board creation and rendering
 */
export class Board {
    constructor() {
        this.scene = null;
        this.boardGroup = null;
        this.pathPoints = [];

        // Board configuration
        this.config = {
            boardSize: 10,
            tileSize: 1.0,
            tileHeight: 0.1,
            boardThickness: 0.2,
            pathWidth: 0.8
        };

        // Materials
        this.materials = {};
    }

    /**
     * Initialize the board
     */
    async init(scene) {
        this.scene = scene;
        console.log('📋 Initializing game board...');

        this.createMaterials();
        this.generatePathPoints();

        console.log('✅ Board initialized');
    }

    /**
     * Create materials for the board
     */
    createMaterials() {
        // Board surface material
        this.materials.board = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            metalness: 0.1,
            roughness: 0.8
        });

        // Tile material
        this.materials.tile = new THREE.MeshStandardMaterial({
            color: 0x34495e,
            metalness: 0.0,
            roughness: 0.9
        });

        // Path material
        this.materials.path = new THREE.MeshStandardMaterial({
            color: 0x1abc9c,
            metalness: 0.2,
            roughness: 0.6,
            emissive: 0x1abc9c,
            emissiveIntensity: 0.05
        });

        // Snake material
        this.materials.snake = new THREE.MeshStandardMaterial({
            color: 0xe74c3c,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0xe74c3c,
            emissiveIntensity: 0.1
        });

        // Ladder material
        this.materials.ladder = new THREE.MeshStandardMaterial({
            color: 0x27ae60,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0x27ae60,
            emissiveIntensity: 0.1
        });
    }

    /**
     * Generate the path points for the boustrophedon pattern
     */
    generatePathPoints() {
        this.pathPoints = [];
        const { boardSize, tileSize } = this.config;

        for (let row = 0; row < boardSize; row++) {
            const y = 0;
            const z = row * tileSize;

            if (row % 2 === 0) {
                // Left to right
                for (let col = 0; col < boardSize; col++) {
                    this.pathPoints.push(new THREE.Vector3(
                        col * tileSize + tileSize / 2,
                        y,
                        z + tileSize / 2
                    ));
                }
            } else {
                // Right to left
                for (let col = boardSize - 1; col >= 0; col--) {
                    this.pathPoints.push(new THREE.Vector3(
                        col * tileSize + tileSize / 2,
                        y,
                        z + tileSize / 2
                    ));
                }
            }
        }
    }

    /**
     * Create the game board
     */
    createBoard() {
        console.log('🔧 Creating 3D game board...');

        // Create board group
        this.boardGroup = new THREE.Group();
        this.boardGroup.name = 'GameBoard';

        // Create board base
        this.createBoardBase();

        // Create tiles
        this.createTiles();

        // Create path
        this.createPath();

        // Create snakes and ladders
        this.createSnakesAndLadders();

        // Add to scene
        this.scene.add(this.boardGroup);

        console.log('✅ Board created');
    }

    /**
     * Create the board base
     */
    createBoardBase() {
        const { boardSize, tileSize, boardThickness } = this.config;

        // Create board geometry
        const boardGeometry = new THREE.BoxGeometry(
            boardSize * tileSize + 0.5,
            boardThickness,
            boardSize * tileSize + 0.5
        );

        const boardMesh = new THREE.Mesh(boardGeometry, this.materials.board);
        boardMesh.position.set(
            (boardSize * tileSize) / 2,
            -boardThickness / 2,
            (boardSize * tileSize) / 2
        );
        boardMesh.receiveShadow = true;

        this.boardGroup.add(boardMesh);
    }

    /**
     * Create individual tiles
     */
    createTiles() {
        const { boardSize, tileSize, tileHeight } = this.config;

        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                // Create tile geometry
                const tileGeometry = new THREE.BoxGeometry(
                    tileSize * 0.9,
                    tileHeight,
                    tileSize * 0.9
                );

                const tileMesh = new THREE.Mesh(tileGeometry, this.materials.tile);
                tileMesh.position.set(
                    col * tileSize + tileSize / 2,
                    tileHeight / 2,
                    row * tileSize + tileSize / 2
                );
                tileMesh.castShadow = true;
                tileMesh.receiveShadow = true;

                // Add tile number (for debugging)
                const position = row * boardSize + col + 1;
                tileMesh.userData = { position };

                this.boardGroup.add(tileMesh);
            }
        }
    }

    /**
     * Create the path visualization
     */
    createPath() {
        const { pathWidth } = this.config;

        // Create path segments
        for (let i = 0; i < this.pathPoints.length - 1; i++) {
            const start = this.pathPoints[i];
            const end = this.pathPoints[i + 1];

            // Create path segment
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            direction.normalize();

            const pathGeometry = new THREE.BoxGeometry(
                pathWidth,
                0.05,
                length
            );

            const pathMesh = new THREE.Mesh(pathGeometry, this.materials.path);
            pathMesh.position.copy(start).add(end).multiplyScalar(0.5);
            pathMesh.position.y = 0.08; // Slightly above tiles
            pathMesh.lookAt(end);
            pathMesh.castShadow = false;
            pathMesh.receiveShadow = true;

            this.boardGroup.add(pathMesh);
        }
    }

    /**
     * Create snakes and ladders
     */
    createSnakesAndLadders() {
        // Snakes
        const snakes = new Map([
            [27, 5], [40, 3], [54, 31], [66, 45],
            [76, 58], [89, 53], [99, 41]
        ]);

        // Ladders
        const ladders = new Map([
            [2, 23], [8, 34], [20, 41], [32, 51],
            [41, 79], [74, 92]
        ]);

        // Create snakes
        for (const [from, to] of snakes) {
            this.createSnake(from, to);
        }

        // Create ladders
        for (const [from, to] of ladders) {
            this.createLadder(from, to);
        }
    }

    /**
     * Create a snake
     */
    createSnake(from, to) {
        const fromPoint = this.pathPoints[from - 1];
        const toPoint = this.pathPoints[to - 1];

        // Create curved snake body
        this.createCurvedConnection(fromPoint, toPoint, this.materials.snake, 'snake');
    }

    /**
     * Create a ladder
     */
    createLadder(from, to) {
        const fromPoint = this.pathPoints[from - 1];
        const toPoint = this.pathPoints[to - 1];

        // Create ladder rungs
        this.createLadderRungs(fromPoint, toPoint);
    }

    /**
     * Create curved connection (for snakes)
     */
    createCurvedConnection(start, end, material, type) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        midPoint.y += length * 0.3; // Curve upward

        // Create curve
        const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
        const points = curve.getPoints(20);

        // Create tube geometry
        const geometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            20,
            0.05,
            8,
            false
        );

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.userData = { type, from: start, to: end };

        this.boardGroup.add(mesh);
    }

    /**
     * Create ladder rungs
     */
    createLadderRungs(start, end) {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        const numRungs = Math.floor(length / 0.3);

        // Create ladder sides
        const sideGeometry = new THREE.CylinderGeometry(0.02, 0.02, length);
        const sideMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            metalness: 0.1,
            roughness: 0.8
        });

        // Left side
        const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
        leftSide.position.copy(start).add(end).multiplyScalar(0.5);
        leftSide.position.x -= 0.1;
        leftSide.lookAt(end);
        leftSide.castShadow = true;
        this.boardGroup.add(leftSide);

        // Right side
        const rightSide = new THREE.Mesh(sideGeometry.clone(), sideMaterial);
        rightSide.position.copy(start).add(end).multiplyScalar(0.5);
        rightSide.position.x += 0.1;
        rightSide.lookAt(end);
        rightSide.castShadow = true;
        this.boardGroup.add(rightSide);

        // Create rungs
        const rungGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
        const rungMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            metalness: 0.1,
            roughness: 0.8
        });

        for (let i = 1; i < numRungs; i++) {
            const t = i / numRungs;
            const rungPosition = new THREE.Vector3().lerpVectors(start, end, t);

            const rung = new THREE.Mesh(rungGeometry, rungMaterial);
            rung.position.copy(rungPosition);
            rung.position.y += 0.05;
            rung.rotation.z = Math.PI / 2;
            rung.castShadow = true;

            this.boardGroup.add(rung);
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
     * Highlight a position
     */
    highlightPosition(position, color = 0xffff00) {
        const coords = this.getPositionCoordinates(position);
        if (!coords) return;

        // Create highlight effect
        const highlightGeometry = new THREE.RingGeometry(0.3, 0.5, 16);
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        highlight.position.copy(coords);
        highlight.position.y = 0.11; // Above tile
        highlight.rotation.x = -Math.PI / 2;

        // Add to scene temporarily
        this.scene.add(highlight);

        // Remove after animation
        setTimeout(() => {
            this.scene.remove(highlight);
            highlight.geometry.dispose();
            highlight.material.dispose();
        }, 1000);
    }

    /**
     * Dispose of board resources
     */
    dispose() {
        if (this.boardGroup) {
            this.boardGroup.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    }
}