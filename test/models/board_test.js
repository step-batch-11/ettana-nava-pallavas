import Board from "../../src/models/board.js";
import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";

describe("matchPattern", () => {
  let board;

  beforeEach(() => {
    const yarns = [
      [2, 1, 1, 1, 1],
      [2, 3, 2, 2, 2],
      [3, 3, 1, 3, 3],
      [4, 4, 4, 3, 1],
      [5, 5, 1, 5, 5],
    ];
    const tiles = [];

    board = new Board(tiles, yarns);
  });

  it("should match a horizontal pattern of same colors", () => {
    const pattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 0, y: 1 }, color: 1 },
      { coord: { x: 0, y: 2 }, color: 1 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ];
    const matchingStatus = board.matchPattern(yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should match pattern after translation", () => {
    const shiftedPattern = [
      { coord: { x: 2, y: 0 }, color: 1 },
      { coord: { x: 2, y: 1 }, color: 2 },
      { coord: { x: 2, y: 2 }, color: 1 },
    ];
    const { yarns } = board.getState();
    const result = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ];

    const matchingStatus = board.matchPattern(yarns, shiftedPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should allow different pattern colors to map to different yarns", () => {
    const multiColorPattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 0, y: 1 }, color: 2 },
      { coord: { x: 0, y: 2 }, color: 3 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
    ];

    const matchingStatus = board.matchPattern(yarns, multiColorPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should match single-point pattern", () => {
    const singlePointPattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
    ];
    const { yarns } = board.getState();
    const result = [{ x: 0, y: 0 }];
    const matchingStatus = board.matchPattern(yarns, singlePointPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should fail when pattern goes out of bounds after translation", () => {
    const largePattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 0, y: 1 }, color: 1 },
      { coord: { x: 0, y: 2 }, color: 1 },
      { coord: { x: 0, y: 3 }, color: 1 },
      { coord: { x: 0, y: 4 }, color: 1 },
      { coord: { x: 0, y: 5 }, color: 1 },
    ];
    const { yarns } = board.getState();
    const matchingStatus = board.matchPattern(yarns, largePattern);

    assertEquals(matchingStatus.isMatched, false);
  });

  it("should match vertical pattern after rotation", () => {
    const verticalPattern = [
      { coord: { x: 0, y: 0 }, color: 1 },
      { coord: { x: 1, y: 0 }, color: 1 },
      { coord: { x: 2, y: 0 }, color: 1 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ];
    const matchingStatus = board.matchPattern(yarns, verticalPattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("should match a pattern that present before the actual design coordinate", () => {
    const pattern = [
      { coord: { x: 4, y: 0 }, color: 1 },
      { coord: { x: 4, y: 1 }, color: 1 },
      { coord: { x: 4, y: 2 }, color: 1 },
      { coord: { x: 4, y: 3 }, color: 1 },
    ];
    const { yarns } = board.getState();

    const result = [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ];
    const matchingStatus = board.matchPattern(yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("complex pattern matches after translation", () => {
    const yarns = [
      [2, 1, 1, 3, 1],
      [2, 2, 3, 1, 2],
      [3, 2, 1, 3, 3],
      [4, 4, 5, 1, 1],
      [4, 5, 1, 5, 5],
    ];

    const board = new Board([], yarns);
    const boardState = board.getState();

    const pattern = [
      { coord: { x: 1, y: 1 }, color: 1 },
      { coord: { x: 1, y: 4 }, color: 2 },
      { coord: { x: 2, y: 2 }, color: 1 },
      { coord: { x: 2, y: 3 }, color: 2 },
      { coord: { x: 3, y: 2 }, color: 3 },
      { coord: { x: 3, y: 3 }, color: 4 },
      { coord: { x: 4, y: 1 }, color: 3 },
      { coord: { x: 4, y: 4 }, color: 4 },
    ];

    const result = [
      { x: 1, y: 0 },
      { x: 1, y: 3 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 4, y: 0 },
      { x: 4, y: 3 },
    ];
    const matchingStatus = board.matchPattern(boardState.yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });

  it("complex pattern matches after rotation", () => {
    const yarns = [
      [2, 1, 3, 3, 1],
      [2, 2, 3, 3, 2],
      [2, 2, 2, 1, 3],
      [2, 4, 5, 3, 1],
      [2, 5, 1, 3, 5],
    ];

    const pattern = [
      { coord: { x: 0, y: 2 }, color: 1 },
      { coord: { x: 1, y: 2 }, color: 1 },
      { coord: { x: 2, y: 2 }, color: 2 },
      { coord: { x: 2, y: 3 }, color: 3 },
      { coord: { x: 2, y: 4 }, color: 3 },
      { coord: { x: 3, y: 2 }, color: 1 },
      { coord: { x: 4, y: 2 }, color: 1 },
    ];

    const board = new Board([], yarns);
    const boardState = board.getState();

    const result = [
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ];
    const matchingStatus = board.matchPattern(boardState.yarns, pattern);

    assertEquals(matchingStatus.isMatched, true);
    assertEquals(matchingStatus.matches, result);
  });
});
