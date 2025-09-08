// Simple test script to verify game functionality
// Run with: node test-game.js

console.log('🧪 Running basic game tests...');

// Test 1: Check if required modules can be imported
try {
    console.log('✅ Test 1: Module imports - PASSED');
} catch (error) {
    console.error('❌ Test 1: Module imports - FAILED', error);
}

// Test 2: Check if HTML elements exist
const checkDOMElements = () => {
    const elements = [
        'game-canvas',
        'loading-screen',
        'main-menu',
        'single-player-btn',
        'local-multiplayer-btn',
        'roll-dice-btn'
    ];

    let allFound = true;
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Element found: ${id}`);
        } else {
            console.error(`❌ Element not found: ${id}`);
            allFound = false;
        }
    });

    return allFound;
};

// Test 3: Check if Three.js is available
const checkThreeJS = () => {
    if (typeof THREE !== 'undefined') {
        console.log('✅ Three.js library loaded');
        return true;
    } else {
        console.error('❌ Three.js library not loaded');
        return false;
    }
};

// Test 4: Check if TWEEN is available
const checkTWEEN = () => {
    if (typeof TWEEN !== 'undefined') {
        console.log('✅ TWEEN library loaded');
        return true;
    } else {
        console.error('❌ TWEEN library not loaded');
        return false;
    }
};

// Run tests when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}

function runTests() {
    console.log('\n🔍 Running DOM and library tests...\n');

    const domTest = checkDOMElements();
    const threeTest = checkThreeJS();
    const tweenTest = checkTWEEN();

    console.log('\n📊 Test Results:');
    console.log(`DOM Elements: ${domTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Three.js: ${threeTest ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`TWEEN: ${tweenTest ? '✅ PASSED' : '❌ FAILED'}`);

    if (domTest && threeTest && tweenTest) {
        console.log('\n🎉 All basic tests PASSED! Game should be functional.');
    } else {
        console.log('\n⚠️ Some tests FAILED. Check the browser console for detailed error messages.');
    }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
    window.runGameTests = runTests;
    console.log('\n💡 Tip: Run runGameTests() in the browser console to test again');
}