// Jest setup for testing
// Mock Three.js since it's not available in Node.js
global.THREE = {
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setPixelRatio: jest.fn(),
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    shadowMap: { enabled: false },
    toneMapping: 0,
    toneMappingExposure: 1.0,
    outputColorSpace: 0
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    background: null
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    aspect: 1,
    updateProjectionMatrix: jest.fn()
  })),
  OrbitControls: jest.fn().mockImplementation(() => ({
    target: { set: jest.fn() },
    enableDamping: true,
    update: jest.fn()
  })),
  HemisphereLight: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    castShadow: false
  })),
  PlaneGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Mesh: jest.fn(),
  WireframeGeometry: jest.fn(),
  LineSegments: jest.fn(),
  LineBasicMaterial: jest.fn(),
  SphereGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(),
  Vector3: jest.fn(),
  CatmullRomCurve3: jest.fn(),
  TubeGeometry: jest.fn(),
  GridHelper: jest.fn(),
  Color: jest.fn(),
  SRGBColorSpace: 0,
  ACESFilmicToneMapping: 0
};

// Mock TWEEN
global.TWEEN = {
  Tween: jest.fn().mockImplementation(() => ({
    to: jest.fn().mockReturnThis(),
    easing: jest.fn().mockReturnThis(),
    onComplete: jest.fn().mockReturnThis(),
    start: jest.fn(),
    yoyo: jest.fn().mockReturnThis()
  })),
  Easing: {
    Quadratic: { InOut: jest.fn() },
    Cubic: { InOut: jest.fn() }
  },
  update: jest.fn()
};

// Mock DOM elements
document.getElementById = jest.fn().mockImplementation((id) => {
  const mockElement = {
    textContent: '',
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    appendChild: jest.fn(),
    innerHTML: '',
    click: jest.fn()
  };
  return mockElement;
});

window.addEventListener = jest.fn();
window.removeEventListener = jest.fn();
window.innerWidth = 800;
window.innerHeight = 600;
window.devicePixelRatio = 1;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock navigator
global.navigator = {
  serviceWorker: {
    register: jest.fn().mockResolvedValue({})
  }
};

// Mock performance
global.performance = {
  now: jest.fn().mockReturnValue(0)
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation(cb => setTimeout(cb, 16));

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};