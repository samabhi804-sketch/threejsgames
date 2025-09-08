import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Board } from '../game/Board.js';
import { PlayerManager } from '../game/PlayerManager.js';

/**
 * Manages the Three.js scene, camera, renderer, and 3D objects
 */
export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.board = null;
        this.playerManager = null;

        // Animation and timing
        this.clock = new THREE.Clock();
        this.isPaused = false;

        // Scene configuration
        this.config = {
            backgroundColor: 0x0a0a0e,
            fogColor: 0x1a1a2e,
            fogNear: 10,
            fogFar: 100,
            ambientLightIntensity: 0.4,
            directionalLightIntensity: 1.0
        };
    }

    /**
     * Initialize the Three.js scene
     */
    async init() {
        try {
            console.log('🎨 [DEBUG] Initializing Three.js scene...');
            console.log('🎨 [DEBUG] Scene config:', this.config);

            console.log('🎨 [DEBUG] Step 1: Creating renderer...');
            this.createRenderer();
            console.log('✅ [DEBUG] Renderer created');

            console.log('🎨 [DEBUG] Step 2: Creating scene...');
            this.createScene();
            console.log('✅ [DEBUG] Scene created');

            console.log('🎨 [DEBUG] Step 3: Creating camera...');
            this.createCamera();
            console.log('✅ [DEBUG] Camera created');

            console.log('🎨 [DEBUG] Step 4: Creating lights...');
            this.createLights();
            console.log('✅ [DEBUG] Lights created');

            console.log('🎨 [DEBUG] Step 5: Creating controls...');
            this.createControls();
            console.log('✅ [DEBUG] Controls created');

            // Initialize game objects
            console.log('🎨 [DEBUG] Step 6: Creating Board...');
            this.board = new Board();
            console.log('🎨 [DEBUG] Board created, calling init()...');
            await this.board.init(this.scene);
            console.log('✅ [DEBUG] Board initialized');

            console.log('🎨 [DEBUG] Step 7: Creating PlayerManager...');
            this.playerManager = new PlayerManager();
            console.log('🎨 [DEBUG] PlayerManager created, calling init()...');
            await this.playerManager.init(this.scene);
            console.log('✅ [DEBUG] PlayerManager initialized');

            // Handle window resize
            console.log('🎨 [DEBUG] Step 8: Setting up resize listener...');
            window.addEventListener('resize', () => this.onResize());
            console.log('✅ [DEBUG] Resize listener set up');

            console.log('✅ [DEBUG] Three.js scene initialization completed');

        } catch (error) {
            console.error('❌ [DEBUG] Failed to initialize Three.js scene:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw error;
        }
    }

    /**
     * Create the WebGL renderer
     */
    createRenderer() {
        console.log('🎨 [DEBUG] Creating WebGL renderer...');

        const canvas = document.getElementById('game-canvas');
        console.log('🎨 [DEBUG] Canvas element:', canvas);

        if (!canvas) {
            console.error('❌ [DEBUG] Canvas element not found!');
            throw new Error('Canvas element not found');
        }

        console.log('🎨 [DEBUG] Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('🎨 [DEBUG] Window dimensions:', window.innerWidth, 'x', window.innerHeight);

        console.log('🎨 [DEBUG] Creating WebGLRenderer with options...');
        const rendererOptions = {
            canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        };
        console.log('🎨 [DEBUG] Renderer options:', rendererOptions);

        try {
            console.log('🎨 [DEBUG] Attempting to create WebGLRenderer...');
            console.log('🎨 [DEBUG] Checking WebGL context availability...');

            // Check WebGL context before creating renderer
            const testGl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            console.log('🎨 [DEBUG] WebGL context test result:', testGl ? 'available' : 'unavailable');
            if (testGl) {
                console.log('🎨 [DEBUG] WebGL context details:', {
                    vendor: testGl.getParameter(testGl.VENDOR),
                    renderer: testGl.getParameter(testGl.RENDERER),
                    version: testGl.getParameter(testGl.VERSION),
                    shadingLanguageVersion: testGl.getParameter(testGl.SHADING_LANGUAGE_VERSION),
                    maxTextureSize: testGl.getParameter(testGl.MAX_TEXTURE_SIZE),
                    extensions: testGl.getSupportedExtensions()
                });
            }

            this.renderer = new THREE.WebGLRenderer(rendererOptions);
            console.log('✅ [DEBUG] WebGLRenderer created successfully');
            console.log('🎨 [DEBUG] Renderer capabilities:', this.renderer.capabilities);
        } catch (error) {
            console.error('❌ [DEBUG] Failed to create WebGLRenderer:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            console.error('❌ [DEBUG] Browser info:', {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                webglSupport: !!canvas.getContext('webgl'),
                experimentalWebglSupport: !!canvas.getContext('experimental-webgl')
            });
            throw error;
        }

        console.log('🎨 [DEBUG] Setting renderer size...');
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        console.log('✅ [DEBUG] Renderer size set');

        console.log('🎨 [DEBUG] Setting pixel ratio...');
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        console.log('🎨 [DEBUG] Device pixel ratio:', window.devicePixelRatio, '-> using:', pixelRatio);
        this.renderer.setPixelRatio(pixelRatio);
        console.log('✅ [DEBUG] Pixel ratio set');

        // Advanced renderer settings
        console.log('🎨 [DEBUG] Applying advanced renderer settings...');
        this.renderer.setClearColor(this.config.backgroundColor);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Enable physically based lighting
        this.renderer.physicallyCorrectLights = true;

        console.log('✅ [DEBUG] Renderer configuration completed');
        console.log('🎨 [DEBUG] Renderer info:', {
            capabilities: this.renderer.capabilities,
            info: this.renderer.info
        });
    }

    /**
     * Create the scene
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);

        // Add fog for depth
        this.scene.fog = new THREE.Fog(
            this.config.fogColor,
            this.config.fogNear,
            this.config.fogFar
        );
    }

    /**
     * Create the camera
     */
    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);

        // Position camera for good board view
        this.camera.position.set(8, 12, 8);
        this.camera.lookAt(5, 0, 5);
    }

    /**
     * Create lighting
     */
    createLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, this.config.ambientLightIntensity);
        this.scene.add(ambientLight);

        // Directional light for shadows and definition
        const directionalLight = new THREE.DirectionalLight(0xffffff, this.config.directionalLightIntensity);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;

        // Configure shadow properties
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;

        this.scene.add(directionalLight);

        // Add a subtle rim light
        const rimLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
        rimLight.position.set(-5, 10, -5);
        this.scene.add(rimLight);
    }

    /**
     * Create camera controls
     */
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // Configure controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Prevent going below ground

        // Set initial target
        this.controls.target.set(5, 0, 5);
    }

    /**
     * Set up the game scene
     */
    setupGameScene() {
        if (this.board) {
            this.board.createBoard();
        }

        if (this.playerManager) {
            this.playerManager.createPlayers(4); // Default to 4 players
        }

        // Reset camera position
        this.camera.position.set(8, 12, 8);
        this.controls.target.set(5, 0, 5);
        this.controls.update();
    }

    /**
     * Animate dice roll
     */
    animateDiceRoll(value) {
        // Create a simple dice animation
        console.log(`🎲 Animating dice roll: ${value}`);

        // For now, just log - we'll implement proper dice animation later
        // This could involve 3D dice models, physics, etc.
    }

    /**
     * Animate player movement
     */
    async animatePlayerMovement(playerId, fromPosition, toPosition) {
        if (!this.playerManager) return;

        console.log(`🚶 Animating player ${playerId} movement: ${fromPosition} → ${toPosition}`);

        // Calculate path points
        const path = this.board.getPathPoints();
        const startIndex = fromPosition - 1;
        const endIndex = Math.min(toPosition - 1, path.length - 1);

        // Animate along the path
        await this.playerManager.animatePlayerAlongPath(playerId, path, startIndex, endIndex);
    }

    /**
     * Animate teleport (snake/ladder)
     */
    async animateTeleport(playerId, fromPosition, toPosition) {
        if (!this.playerManager) return;

        console.log(`✨ Animating teleport for player ${playerId}: ${fromPosition} → ${toPosition}`);

        const path = this.board.getPathPoints();
        const fromIndex = fromPosition - 1;
        const toIndex = toPosition - 1;

        // Create a special teleport animation
        await this.playerManager.animateTeleport(playerId, path[fromIndex], path[toIndex]);
    }

    /**
     * Update scene objects
     */
    update(time) {
        if (this.isPaused) return;

        const deltaTime = this.clock.getDelta();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update game objects
        if (this.board) {
            this.board.update(deltaTime);
        }

        if (this.playerManager) {
            this.playerManager.update(deltaTime);
        }
    }

    /**
     * Render the scene
     */
    render() {
        if (!this.renderer || !this.scene || !this.camera) return;

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    onResize() {
        if (!this.camera || !this.renderer) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Pause scene updates
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume scene updates
     */
    resume() {
        this.isPaused = false;
        this.clock.getDelta(); // Reset clock to avoid large delta
    }

    /**
     * Clean up resources
     */
    dispose() {
        console.log('🧹 Disposing scene resources...');

        // Dispose of geometries, materials, and textures
        this.scene.traverse((object) => {
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

        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }

        // Dispose of controls
        if (this.controls) {
            this.controls.dispose();
        }

        console.log('✅ Scene resources disposed');
    }
}