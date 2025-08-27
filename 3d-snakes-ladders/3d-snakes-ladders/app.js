(() => {
	const canvas = document.getElementById('game-canvas');
	const hud = {
		turn: document.getElementById('turn-indicator'),
		dice: document.getElementById('dice-display'),
		fps: document.getElementById('fps-display'),
		leaderboard: document.getElementById('leaderboard')
	};

	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setSize(window.innerWidth, window.innerHeight);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0a0a0e);

	const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
	camera.position.set(12, 14, 18);

	const controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(5, 0, 5);
	controls.enableDamping = true;

	// Lights
	const hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.8);
	scene.add(hemi);
	const ambient = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambient);
	const dir = new THREE.DirectionalLight(0xffffff, 1.0);
	dir.position.set(10, 18, 8);
	dir.castShadow = false;
	scene.add(dir);

	// Temp: ground grid helper
	const grid = new THREE.GridHelper(20, 20, 0x666666, 0x333333);
	scene.add(grid);

	// Resize
	window.addEventListener('resize', () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	});

	// FPS meter
	let last = performance.now();
	let frames = 0;
	let lastFpsUpdate = last;

	function animate(now) {
		requestAnimationFrame(animate);
		TWEEN.update(now);
		controls.update();
		renderer.render(scene, camera);

		frames++;
		if (now - lastFpsUpdate > 1000) {
			hud.fps.textContent = `FPS: ${frames}`;
			frames = 0;
			lastFpsUpdate = now;
		}
		last = now;
	}
	requestAnimationFrame(animate);

	// Basic UI state
	hud.turn.textContent = 'Turn: Ready';
	hud.dice.textContent = 'Dice: -';

	// Menu buttons (no-op for now)
	document.getElementById('play-single').addEventListener('click', () => {
		document.getElementById('menu').style.display = 'none';
	});
	document.getElementById('play-local').addEventListener('click', () => {
		document.getElementById('menu').style.display = 'none';
	});
	document.getElementById('play-online').addEventListener('click', () => {
		document.getElementById('menu').style.display = 'none';
	});

	// Firebase placeholder
	window.initFirebase = (config) => {
		firebase.initializeApp(config);
		console.log('Firebase initialized');
	};
})();