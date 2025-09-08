(() => {
	// Check for required libraries
	if (typeof THREE === 'undefined') {
		console.error('Three.js library failed to load. Please check your internet connection.');
		document.getElementById('app').innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-family: Arial, sans-serif;"><h1>3D Snakes & Ladders</h1><p>Failed to load Three.js library. Please refresh the page or check your internet connection.</p></div>';
		return;
	}

	if (typeof TWEEN === 'undefined') {
		console.error('TWEEN library failed to load.');
		// Create a basic fallback for TWEEN
		window.TWEEN = {
			Tween: function(obj) {
				this.obj = obj;
				this.to = function(target) { this.target = target; return this; };
				this.easing = function() { return this; };
				this.onComplete = function(callback) { this.completeCallback = callback; return this; };
				this.start = function() {
					Object.assign(this.obj, this.target);
					if (this.completeCallback) this.completeCallback();
					return this;
				};
			},
			Easing: {
				Quadratic: { InOut: function(t) { return t; } },
				Cubic: { InOut: function(t) { return t; } }
			},
			update: function() {}
		};
		console.warn('Using fallback animation system');
	}

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
			const winnerName = `Player ${currentPlayer + 1}`;
			hud.turn.textContent = `${winnerName} wins!`;
			recordWin(winnerName);
			return;
		}
		currentPlayer = (currentPlayer + 1) % playerMeshes.length;
		hud.turn.textContent = `Turn: Player ${currentPlayer + 1}`;
	}

	function rollDice() {
		const value = 1 + Math.floor(Math.random() * 6);
		console.log(`Rolling dice: ${value}`);
		hud.dice.textContent = `Dice: ${value}`;
		movePlayerBy(value);
	}

	const rollBtn = document.getElementById('roll-btn');
	const endTurnBtn = document.getElementById('end-turn-btn');

	if (rollBtn) {
		rollBtn.addEventListener('click', rollDice);
		console.log('Roll button event listener attached');
	} else {
		console.error('Roll button not found');
	}

	if (endTurnBtn) {
		endTurnBtn.addEventListener('click', endTurn);
		console.log('End turn button event listener attached');
	} else {
		console.error('End turn button not found');
	}
	document.getElementById('login-btn').addEventListener('click', async () => {
		if (services && services.auth) {
			try { await services.auth.signInAnonymously(); } catch (e) { console.warn(e); }
		} else {
			localStorage.setItem('guestUser', JSON.stringify({ name: 'Guest' }));
			updateAuthUI();
			fetchLeaderboard();
		}
	});
	document.getElementById('logout-btn').addEventListener('click', async () => {
		try { if (services && services.auth) await services.auth.signOut(); } catch (e) { console.warn(e); }
		localStorage.removeItem('guestUser');
		updateAuthUI();
		fetchLeaderboard();
	});

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

	function startGame() {
		const menu = document.getElementById('menu');
		if (menu) menu.style.display = 'none';
		hud.turn.textContent = 'Turn: Player 1';
	}

	// Menu buttons
	const btnSingle = document.getElementById('play-single');
	const btnLocal = document.getElementById('play-local');
	const btnOnline = document.getElementById('play-online');

	if (btnSingle) {
		btnSingle.addEventListener('click', startGame);
		console.log('Single player button event listener attached');
	} else {
		console.error('Single player button not found');
	}

	if (btnLocal) {
		btnLocal.addEventListener('click', startGame);
		console.log('Local multiplayer button event listener attached');
	} else {
		console.error('Local multiplayer button not found');
	}

	if (btnOnline) {
		btnOnline.addEventListener('click', startGame);
		console.log('Online multiplayer button event listener attached');
	} else {
		console.error('Online multiplayer button not found');
	}

	// Firebase, Leaderboard, and Networking helpers
	const services = { firebaseApp: null, auth: null, db: null, user: null };
	function updateAuthUI() {
		const loginBtn = document.getElementById('login-btn');
		const logoutBtn = document.getElementById('logout-btn');
		const guest = JSON.parse(localStorage.getItem('guestUser') || 'null');
		const isLoggedIn = !!(services.user || guest);
		if (loginBtn && logoutBtn) {
			loginBtn.style.display = isLoggedIn ? 'none' : '';
			logoutBtn.style.display = isLoggedIn ? '' : 'none';
		}
	}
	async function fetchLeaderboard() {
		const list = hud.leaderboard;
		if (!list) return;
		list.innerHTML = '';
		try {
			if (services.db) {
				const qs = await services.db.collection('leaderboard').orderBy('wins', 'desc').limit(10).get();
				qs.forEach((doc) => {
					const data = doc.data();
					const li = document.createElement('li');
					li.textContent = `${data.name || 'Anonymous'} — ${data.wins || 0}`;
					list.appendChild(li);
				});
			} else {
				const local = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
				local
					.sort((a,b)=> (b.wins||0) - (a.wins||0))
					.slice(0,10)
					.forEach((data) => {
						const li = document.createElement('li');
						li.textContent = `${data.name || 'Guest'} — ${data.wins || 0}`;
						list.appendChild(li);
					});
			}
		} catch (e) {
			console.warn('Leaderboard fetch failed', e);
		}
	}
	async function recordWin(name) {
		try {
			if (services.db && services.user) {
				const uid = services.user.uid;
				const ref = services.db.collection('leaderboard').doc(uid);
				await services.db.runTransaction(async (tx) => {
					const snap = await tx.get(ref);
					const base = snap.exists ? snap.data() : { name: services.user.displayName || name || 'Anonymous', wins: 0 };
					const updated = {
						name: base.name || name || 'Anonymous',
						wins: (base.wins || 0) + 1,
						updated: firebase.firestore.FieldValue.serverTimestamp()
					};
					tx.set(ref, updated, { merge: true });
				});
			} else {
				const local = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
				const playerName = name || 'Guest';
				const idx = local.findIndex((x) => x.name === playerName);
				if (idx >= 0) local[idx].wins = (local[idx].wins || 0) + 1;
				else local.push({ name: playerName, wins: 1 });
				localStorage.setItem('localLeaderboard', JSON.stringify(local));
			}
		} catch (e) {
			console.warn('recordWin failed', e);
		} finally {
			fetchLeaderboard();
		}
	}
	window.initFirebase = (config) => {
		if (!window.firebase) return null;
		if (!services.firebaseApp) {
			try { firebase.initializeApp(config); } catch (e) {}
			services.firebaseApp = firebase.app();
			services.auth = firebase.auth();
			services.db = firebase.firestore();
			services.auth.onAuthStateChanged((user) => {
				services.user = user || null;
				updateAuthUI();
				fetchLeaderboard();
			});
			console.log('Firebase initialized');
		}
		return services.firebaseApp;
	};
	function initNetworking() {
		const net = { socket: null, connected: false };
		try {
			if (typeof io === 'function') {
				net.socket = io();
				net.socket.on('connect', () => { net.connected = true; console.log('[net] connected'); });
				net.socket.on('disconnect', () => { net.connected = false; console.log('[net] disconnected'); });
			} else {
				console.log('[net] socket.io not present; running offline hot-seat');
			}
		} catch (e) {
			console.log('[net] init failed; using stub', e);
		}
		window.net = net;
	}
	initNetworking();
	updateAuthUI();
	fetchLeaderboard();
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', () => {
			navigator.serviceWorker.register('./service-worker.js').catch((e) => console.warn('SW register failed', e));
		});
	}
})();