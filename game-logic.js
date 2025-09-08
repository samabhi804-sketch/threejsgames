// Extracted game logic for testing
export const BOARD_SIZE = 10;
export const TOTAL_SQUARES = 100;

export const snakes = new Map([
  [27, 5], [40, 3], [54, 31], [66, 45], [76, 58], [89, 53], [99, 41]
]);

export const ladders = new Map([
  [2, 23], [8, 34], [20, 41], [32, 51], [41, 79], [74, 92]
]);

// Generate board path (boustrophedon)
export function generatePath() {
  const path = [];
  const tileSize = 1.0;
  const tileHalf = tileSize / 2;
  for (let row = 0; row < BOARD_SIZE; row++) {
    const y = 0;
    const z = row * tileSize;
    if (row % 2 === 0) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        path.push({ x: col * tileSize + tileHalf, y, z: z + tileHalf });
      }
    } else {
      for (let col = BOARD_SIZE - 1; col >= 0; col--) {
        path.push({ x: col * tileSize + tileHalf, y, z: z + tileHalf });
      }
    }
  }
  return path;
}

// Calculate target position after dice roll
export function calculateTargetPosition(currentPosition, diceValue) {
  let targetIndex = currentPosition + diceValue;
  if (targetIndex > TOTAL_SQUARES) {
    // Bounce back
    targetIndex = TOTAL_SQUARES - (targetIndex - TOTAL_SQUARES);
  }
  return Math.max(1, Math.min(TOTAL_SQUARES, targetIndex)); // Ensure within bounds
}

// Check for snake or ladder at position
export function getTeleportDestination(position) {
  return snakes.get(position) || ladders.get(position) || null;
}

// Check if position is a winning position
export function isWinningPosition(position) {
  return position === TOTAL_SQUARES;
}

// Simulate dice roll
export function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

// Initialize player positions
export function initializePlayerPositions(numPlayers = 4) {
  return new Array(numPlayers).fill(1);
}

// Move player and handle teleports
export function movePlayer(playerPositions, currentPlayer, diceValue) {
  const path = generatePath();
  const startIndex = playerPositions[currentPlayer];
  const targetIndex = calculateTargetPosition(startIndex, diceValue);

  // Simulate movement waypoints
  const waypoints = [];
  for (let i = startIndex; i <= targetIndex; i++) {
    waypoints.push(path[i - 1]);
  }

  // Update position
  playerPositions[currentPlayer] = targetIndex;

  // Check for teleport
  const tele = getTeleportDestination(targetIndex);
  if (tele) {
    playerPositions[currentPlayer] = tele;
  }

  return {
    waypoints,
    finalPosition: playerPositions[currentPlayer],
    teleported: !!tele,
    won: isWinningPosition(playerPositions[currentPlayer])
  };
}

// Check if game should end turn
export function shouldEndTurn(playerPositions, currentPlayer) {
  return isWinningPosition(playerPositions[currentPlayer]);
}

// Switch to next player
export function nextPlayer(currentPlayer, numPlayers = 4) {
  return (currentPlayer + 1) % numPlayers;
}