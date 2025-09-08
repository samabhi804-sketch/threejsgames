import {
  BOARD_SIZE,
  TOTAL_SQUARES,
  snakes,
  ladders,
  generatePath,
  calculateTargetPosition,
  getTeleportDestination,
  isWinningPosition,
  rollDice,
  initializePlayerPositions,
  movePlayer,
  shouldEndTurn,
  nextPlayer
} from '../game-logic.js';

describe('Game Logic Tests', () => {
  describe('Constants', () => {
    test('BOARD_SIZE should be 10', () => {
      expect(BOARD_SIZE).toBe(10);
    });

    test('TOTAL_SQUARES should be 100', () => {
      expect(TOTAL_SQUARES).toBe(100);
    });
  });

  describe('Snakes and Ladders', () => {
    test('snakes map should contain correct mappings', () => {
      expect(snakes.get(27)).toBe(5);
      expect(snakes.get(40)).toBe(3);
      expect(snakes.get(99)).toBe(41);
    });

    test('ladders map should contain correct mappings', () => {
      expect(ladders.get(2)).toBe(23);
      expect(ladders.get(8)).toBe(34);
      expect(ladders.get(74)).toBe(92);
    });
  });

  describe('generatePath', () => {
    test('should generate 100 positions', () => {
      const path = generatePath();
      expect(path).toHaveLength(100);
    });

    test('first position should be at (0.5, 0, 0.5)', () => {
      const path = generatePath();
      expect(path[0]).toEqual({ x: 0.5, y: 0, z: 0.5 });
    });

    test('last position should be at (9.5, 0, 9.5)', () => {
      const path = generatePath();
      expect(path[99]).toEqual({ x: 9.5, y: 0, z: 9.5 });
    });

    test('should follow boustrophedon pattern', () => {
      const path = generatePath();
      // Row 0 (even): left to right
      expect(path[0]).toEqual({ x: 0.5, y: 0, z: 0.5 });
      expect(path[9]).toEqual({ x: 9.5, y: 0, z: 0.5 });
      // Row 1 (odd): right to left
      expect(path[10]).toEqual({ x: 9.5, y: 0, z: 1.5 });
      expect(path[19]).toEqual({ x: 0.5, y: 0, z: 1.5 });
    });
  });

  describe('calculateTargetPosition', () => {
    test('normal move within bounds', () => {
      expect(calculateTargetPosition(1, 6)).toBe(7);
      expect(calculateTargetPosition(50, 3)).toBe(53);
    });

    test('exact move to 100', () => {
      expect(calculateTargetPosition(94, 6)).toBe(100);
    });

    test('bounce back from overshoot', () => {
      expect(calculateTargetPosition(98, 5)).toBe(97); // 103 -> 200-103 = 97
      expect(calculateTargetPosition(99, 6)).toBe(95); // 105 -> 200-105 = 95
      expect(calculateTargetPosition(100, 1)).toBe(99); // 101 -> 200-101 = 99
    });

    test('edge case: maximum overshoot', () => {
      expect(calculateTargetPosition(95, 12)).toBe(93); // 107 -> 200-107 = 93
    });
  });

  describe('getTeleportDestination', () => {
    test('should return snake destination', () => {
      expect(getTeleportDestination(27)).toBe(5);
      expect(getTeleportDestination(99)).toBe(41);
    });

    test('should return ladder destination', () => {
      expect(getTeleportDestination(2)).toBe(23);
      expect(getTeleportDestination(74)).toBe(92);
    });

    test('should return null for no teleport', () => {
      expect(getTeleportDestination(1)).toBeNull();
      expect(getTeleportDestination(50)).toBeNull();
    });
  });

  describe('isWinningPosition', () => {
    test('should return true for position 100', () => {
      expect(isWinningPosition(100)).toBe(true);
    });

    test('should return false for other positions', () => {
      expect(isWinningPosition(99)).toBe(false);
      expect(isWinningPosition(1)).toBe(false);
      expect(isWinningPosition(50)).toBe(false);
    });
  });

  describe('rollDice', () => {
    test('should return value between 1 and 6', () => {
      // Mock Math.random for predictable results
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5); // Should return 4

      expect(rollDice()).toBe(4);

      Math.random = originalRandom;
    });

    test('should handle edge cases of Math.random', () => {
      const originalRandom = Math.random;

      Math.random = jest.fn().mockReturnValue(0); // Should return 1
      expect(rollDice()).toBe(1);

      Math.random = jest.fn().mockReturnValue(0.999); // Should return 6
      expect(rollDice()).toBe(6);

      Math.random = originalRandom;
    });
  });

  describe('initializePlayerPositions', () => {
    test('should initialize with default 4 players at position 1', () => {
      const positions = initializePlayerPositions();
      expect(positions).toEqual([1, 1, 1, 1]);
    });

    test('should initialize with specified number of players', () => {
      const positions = initializePlayerPositions(2);
      expect(positions).toEqual([1, 1]);
    });
  });

  describe('movePlayer', () => {
    test('normal move without teleport', () => {
      const positions = [1, 1, 1, 1];
      const result = movePlayer(positions, 0, 6);

      expect(result.finalPosition).toBe(7);
      expect(result.teleported).toBe(false);
      expect(result.won).toBe(false);
      expect(positions[0]).toBe(7);
      expect(result.waypoints).toHaveLength(7); // positions 1 through 7
    });

    test('move with snake teleport', () => {
      const positions = [25, 1, 1, 1]; // Player at 25
      const result = movePlayer(positions, 0, 2); // Move to 27

      expect(result.finalPosition).toBe(5); // Snake at 27 goes to 5
      expect(result.teleported).toBe(true);
      expect(result.won).toBe(false);
      expect(positions[0]).toBe(5);
    });

    test('move with ladder teleport', () => {
      const positions = [1, 1, 1, 1];
      const result = movePlayer(positions, 0, 1); // Move to 2

      expect(result.finalPosition).toBe(23); // Ladder at 2 goes to 23
      expect(result.teleported).toBe(true);
      expect(result.won).toBe(false);
      expect(positions[0]).toBe(23);
    });

    test('winning move', () => {
      const positions = [94, 1, 1, 1];
      const result = movePlayer(positions, 0, 6); // Move to 100

      expect(result.finalPosition).toBe(100);
      expect(result.teleported).toBe(false);
      expect(result.won).toBe(true);
      expect(positions[0]).toBe(100);
    });

    test('bounce back without winning', () => {
      const positions = [98, 1, 1, 1];
      const result = movePlayer(positions, 0, 5); // Move to 103, bounce to 97

      expect(result.finalPosition).toBe(97);
      expect(result.teleported).toBe(false);
      expect(result.won).toBe(false);
      expect(positions[0]).toBe(97);
    });
  });

  describe('shouldEndTurn', () => {
    test('should end turn when player wins', () => {
      const positions = [100, 1, 1, 1];
      expect(shouldEndTurn(positions, 0)).toBe(true);
    });

    test('should not end turn when player has not won', () => {
      const positions = [99, 1, 1, 1];
      expect(shouldEndTurn(positions, 0)).toBe(false);
    });
  });

  describe('nextPlayer', () => {
    test('should cycle through players', () => {
      expect(nextPlayer(0, 4)).toBe(1);
      expect(nextPlayer(1, 4)).toBe(2);
      expect(nextPlayer(2, 4)).toBe(3);
      expect(nextPlayer(3, 4)).toBe(0);
    });

    test('should work with different player counts', () => {
      expect(nextPlayer(0, 2)).toBe(1);
      expect(nextPlayer(1, 2)).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    test('complete game simulation', () => {
      const positions = initializePlayerPositions(2);
      let currentPlayer = 0;

      // Player 1 moves to ladder
      let result = movePlayer(positions, currentPlayer, 1); // 1 + 1 = 2 -> ladder to 23
      expect(result.finalPosition).toBe(23);
      expect(result.teleported).toBe(true);

      currentPlayer = nextPlayer(currentPlayer, 2);

      // Player 2 moves normally
      result = movePlayer(positions, currentPlayer, 3); // 1 + 3 = 4
      expect(result.finalPosition).toBe(4);
      expect(result.teleported).toBe(false);

      currentPlayer = nextPlayer(currentPlayer, 2);

      // Continue until someone wins
      // This is a simplified test - in reality, the game would continue
      expect(positions).toEqual([23, 4]);
    });

    test('snake encounter after bounce', () => {
      // Test edge case: bounce to a snake position
      const positions = [95, 1, 1, 1];
      // 95 + 6 = 101 -> bounce to 99, which has a snake to 41
      const result = movePlayer(positions, 0, 6);

      expect(result.finalPosition).toBe(41); // 99 -> snake to 41
      expect(result.teleported).toBe(true);
      expect(result.won).toBe(false);
    });
  });
});