import * as THREE from 'three';
import { Tween } from '@tweenjs/tween.js';

/**
 * Manages player pieces, animations, and movements
 */
export class PlayerManager {
    constructor() {
        this.scene = null;
        this.players = [];
        this.playerMeshes = [];

        // Player configuration
        this.config = {
            playerCount: 4,
            pieceHeight: 0.2,
            pieceRadius: 0.15,
            animationSpeed: 0.5,
            jumpHeight: 0.5
        };

        // Colors for different players
        this.playerColors = [
            0x3498db, // Blue
            0xe74c3c, // Red
            0x2ecc71, // Green
            0xf39c12  // Orange
        ];
    }

    /**
     * Initialize the player manager
     */
    async init(scene) {
        this.scene = scene;
        console.log('👥 Initializing player manager...');

        console.log('✅ Player manager initialized');
    }

    /**
     * Create player pieces
     */
    createPlayers(count = 4) {
        console.log(`🎯 Creating ${count} player pieces...`);

        // Clear existing players
        this.clearPlayers();

        this.config.playerCount = count;

        for (let i = 0; i < count; i++) {
            this.createPlayerPiece(i);
        }

        console.log('✅ Player pieces created');
    }

    /**
     * Create a single player piece
     */
    createPlayerPiece(playerId) {
        const { pieceHeight, pieceRadius } = this.config;

        // Create player geometry (cylinder for better stability)
        const geometry = new THREE.CylinderGeometry(pieceRadius, pieceRadius, pieceHeight, 16);

        // Create material with player color
        const material = new THREE.MeshStandardMaterial({
            color: this.playerColors[playerId],
            metalness: 0.3,
            roughness: 0.4,
            emissive: this.playerColors[playerId],
            emissiveIntensity: 0.1
        });

        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { playerId, type: 'player' };

        // Position at start
        mesh.position.set(0.5, pieceHeight / 2, 0.5);

        // Add to scene
        this.scene.add(mesh);
        this.playerMeshes[playerId] = mesh;

        // Create player data
        this.players[playerId] = {
            id: playerId,
            mesh: mesh,
            position: 1,
            isAnimating: false
        };
    }

    /**
     * Clear all player pieces
     */
    clearPlayers() {
        this.playerMeshes.forEach(mesh => {
            if (mesh && this.scene) {
                this.scene.remove(mesh);
                mesh.geometry.dispose();
                mesh.material.dispose();
            }
        });

        this.playerMeshes = [];
        this.players = [];
    }

    /**
     * Get player mesh
     */
    getPlayerMesh(playerId) {
        return this.playerMeshes[playerId];
    }

    /**
     * Set player position
     */
    setPlayerPosition(playerId, position, pathPoints) {
        if (!this.players[playerId] || !pathPoints) return;

        const coords = pathPoints[position - 1];
        if (!coords) return;

        const mesh = this.playerMeshes[playerId];
        mesh.position.set(coords.x, this.config.pieceHeight / 2, coords.z);
        this.players[playerId].position = position;
    }

    /**
     * Animate player movement along path
     */
    async animatePlayerAlongPath(playerId, pathPoints, startIndex, endIndex) {
        return new Promise((resolve) => {
            if (!this.players[playerId]) {
                resolve();
                return;
            }

            const player = this.players[playerId];
            player.isAnimating = true;

            const mesh = this.playerMeshes[playerId];
            const waypoints = [];

            // Collect waypoints
            for (let i = startIndex; i <= endIndex; i++) {
                if (pathPoints[i]) {
                    waypoints.push(pathPoints[i]);
                }
            }

            if (waypoints.length === 0) {
                player.isAnimating = false;
                resolve();
                return;
            }

            // Animate through waypoints
            this.animateThroughWaypoints(mesh, waypoints, 0, () => {
                player.isAnimating = false;
                player.position = endIndex + 1;
                resolve();
            });
        });
    }

    /**
     * Animate through a series of waypoints
     */
    animateThroughWaypoints(mesh, waypoints, currentIndex, onComplete) {
        if (currentIndex >= waypoints.length) {
            onComplete();
            return;
        }

        const target = waypoints[currentIndex];
        const duration = 300; // ms per move

        // Create movement tween
        new Tween(mesh.position)
            .to({
                x: target.x,
                z: target.z
            }, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
                // Add a small bounce effect
                this.addBounceEffect(mesh, () => {
                    this.animateThroughWaypoints(mesh, waypoints, currentIndex + 1, onComplete);
                });
            })
            .start();
    }

    /**
     * Add bounce effect to player piece
     */
    addBounceEffect(mesh, onComplete) {
        const originalY = mesh.position.y;
        const bounceHeight = 0.1;

        new Tween(mesh.position)
            .to({ y: originalY + bounceHeight }, 150)
            .easing(TWEEN.Easing.Quadratic.Out)
            .yoyo(true)
            .repeat(1)
            .onComplete(onComplete)
            .start();
    }

    /**
     * Animate teleport (snake/ladder)
     */
    async animateTeleport(playerId, fromPoint, toPoint) {
        return new Promise((resolve) => {
            if (!this.players[playerId]) {
                resolve();
                return;
            }

            const player = this.players[playerId];
            player.isAnimating = true;

            const mesh = this.playerMeshes[playerId];

            // Create teleport animation sequence
            const sequence = [];

            // 1. Lift up
            sequence.push(new Tween(mesh.position)
                .to({ y: mesh.position.y + 1.0 }, 300)
                .easing(TWEEN.Easing.Quadratic.Out));

            // 2. Move horizontally
            sequence.push(new Tween(mesh.position)
                .to({ x: toPoint.x, z: toPoint.z }, 500)
                .easing(TWEEN.Easing.Quadratic.InOut));

            // 3. Drop down
            sequence.push(new Tween(mesh.position)
                .to({ y: this.config.pieceHeight / 2 }, 300)
                .easing(TWEEN.Easing.Quadratic.In)
                .onComplete(() => {
                    player.isAnimating = false;
                    player.position = this.getPositionFromCoords(toPoint);
                    resolve();
                }));

            // Chain animations
            for (let i = 1; i < sequence.length; i++) {
                sequence[i - 1].chain(sequence[i]);
            }

            sequence[0].start();
        });
    }

    /**
     * Get position number from coordinates
     */
    getPositionFromCoords(coords) {
        // This would need to be implemented based on the board layout
        // For now, return a placeholder
        return 1;
    }

    /**
     * Highlight current player
     */
    highlightPlayer(playerId) {
        // Remove previous highlights
        this.clearHighlights();

        if (!this.players[playerId]) return;

        const mesh = this.playerMeshes[playerId];

        // Create highlight ring
        const ringGeometry = new THREE.RingGeometry(0.25, 0.35, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const highlight = new THREE.Mesh(ringGeometry, ringMaterial);
        highlight.position.copy(mesh.position);
        highlight.position.y = 0.01; // Just above ground
        highlight.rotation.x = -Math.PI / 2;

        // Add pulsing animation
        new Tween(highlight.material)
            .to({ opacity: 0.3 }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .yoyo(true)
            .repeat(Infinity)
            .start();

        highlight.userData = { type: 'highlight', playerId };
        this.scene.add(highlight);
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.scene.children.forEach(child => {
            if (child.userData?.type === 'highlight') {
                this.scene.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
        });
    }

    /**
     * Check if player is currently animating
     */
    isPlayerAnimating(playerId) {
        return this.players[playerId]?.isAnimating || false;
    }

    /**
     * Check if any player is animating
     */
    isAnyPlayerAnimating() {
        return this.players.some(player => player.isAnimating);
    }

    /**
     * Update player manager (called every frame)
     */
    update(deltaTime) {
        // Update any player-specific animations or effects
        // For now, this is a placeholder
    }

    /**
     * Dispose of player resources
     */
    dispose() {
        this.clearPlayers();
        this.clearHighlights();
    }
}