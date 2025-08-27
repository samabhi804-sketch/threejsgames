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
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;
	renderer.shadowMap.enabled = false;

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

	// Board generation: 10x10 boustrophedon path
	const boardSize = 10;
	const tileSize = 1.0;
	const tileHalf = tileSize / 2;
	const path = [];
	for (let row = 0; row < boardSize; row++) {
		const y = 0;
		const z = row * tileSize;
		if (row % 2 === 0) {
			for (let col = 0; col < boardSize; col++) {
				path.push(new THREE.Vector3(col * tileSize + tileHalf, y, z + tileHalf));
			}
		} else {
			for (let col = boardSize - 1; col >= 0; col--) {
				path.push(new THREE.Vector3(col * tileSize + tileHalf, y, z + tileHalf));
			}
		}
	}

	// Draw a minimal board surface
	const boardGeom = new THREE.PlaneGeometry(boardSize * tileSize, boardSize * tileSize, boardSize, boardSize);
	const boardMat = new THREE.MeshStandardMaterial({ color: 0x203040, metalness: 0.0, roughness: 0.95 });
	const boardMesh = new THREE.Mesh(boardGeom, boardMat);
	boardMesh.rotation.x = -Math.PI / 2;
	scene.add(boardMesh);

	// Draw tiles grid lines using LineSegments
	const tileLines = new THREE.LineSegments(
		new THREE.WireframeGeometry(boardGeom),
		new THREE.LineBasicMaterial({ color: 0x445566 })
	);
	tileLines.rotation.x = -Math.PI / 2;
	scene.add(tileLines);

	// Snakes and ladders mapping (1-indexed squares)
	const snakes = new Map([
		[27, 5], [40, 3], [54, 31], [66, 45], [76, 58], [89, 53], [99, 41]
	]);
	const ladders = new Map([
		[2, 23], [8, 34], [20, 41], [32, 51], [41, 79], [74, 92]
	]);

	// Visualize snakes and ladders as colored lines
	function drawLink(fromIndex, toIndex, color) {
		const from = path[fromIndex - 1];
		const to = path[toIndex - 1];
		const points = [
			new THREE.Vector3(from.x, 0.02, from.z),
			new THREE.Vector3((from.x + to.x) / 2, 0.6, (from.z + to.z) / 2),
			new THREE.Vector3(to.x, 0.02, to.z)
		];
		const curve = new THREE.CatmullRomCurve3(points);
		const curveGeom = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);
		const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.15 });
		const mesh = new THREE.Mesh(curveGeom, mat);
		scene.add(mesh);
	}
	for (const [from, to] of snakes) drawLink(from, to, 0xd9534f);
	for (const [from, to] of ladders) drawLink(from, to, 0x5cb85c);

	// Player markers
	const playerColors = [0x4aa3ff, 0xffcc00, 0xff66aa, 0x66ff99];
	const playerMeshes = [];
	for (let i = 0; i < 4; i++) {
		const geom = new THREE.SphereGeometry(0.18, 24, 16);
		const mat = new THREE.MeshStandardMaterial({ color: playerColors[i] });
		const mesh = new THREE.Mesh(geom, mat);
		mesh.position.copy(path[0]).add(new THREE.Vector3(0, 0.18, 0));
		scene.add(mesh);
		playerMeshes.push(mesh);
	}

	const playerPositions = [1, 1, 1, 1]; // 1-indexed board indices
	let currentPlayer = 0;

	function movePlayerBy(steps) {
		const startIndex = playerPositions[currentPlayer];
		let targetIndex = startIndex + steps;
		if (targetIndex > 100) targetIndex = 100 - (targetIndex - 100); // bounce back rule

		const player = playerMeshes[currentPlayer];
		const waypoints = [];
		for (let i = startIndex; i <= targetIndex; i++) waypoints.push(path[i - 1]);
		let chain = Promise.resolve();
		waypoints.forEach((p, idx) => {
			chain = chain.then(() => new Promise((resolve) => {
				new TWEEN.Tween(player.position)
					.to({ x: p.x, y: 0.18, z: p.z }, 250)
					.easing(TWEEN.Easing.Quadratic.InOut)
					.onComplete(resolve)
					.start();
			}));
		});

		chain.then(() => {
			playerPositions[currentPlayer] = targetIndex;
			const tele = snakes.get(targetIndex) || ladders.get(targetIndex);
			if (tele) {
				new TWEEN.Tween(player.position)
					.to({ x: path[tele - 1].x, y: 0.6, z: path[tele - 1].z }, 350)
					.yoyo(false)
					.easing(TWEEN.Easing.Cubic.InOut)
					.onComplete(() => {
						player.position.y = 0.18;
						playerPositions[currentPlayer] = tele;
						endTurn();
					})
					.start();
			} else {
				endTurn();
			}
		});
	}

	function endTurn() {
		if (playerPositions[currentPlayer] >= 100) {
			hud.turn.textContent = `Player ${currentPlayer + 1} wins!`;
			return;
		}
		currentPlayer = (currentPlayer + 1) % playerMeshes.length;
		hud.turn.textContent = `Turn: Player ${currentPlayer + 1}`;
	}

	function rollDice() {
		const value = 1 + Math.floor(Math.random() * 6);
		hud.dice.textContent = `Dice: ${value}`;
		movePlayerBy(value);
	}

	document.getElementById('roll-btn').addEventListener('click', rollDice);
	document.getElementById('end-turn-btn').addEventListener('click', endTurn);

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
	hud.turn.textContent = 'Turn: Player 1';
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