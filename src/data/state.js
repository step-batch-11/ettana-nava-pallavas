import Player from "../models/player.js";

const player1 = new Player(1, "Ajoy");
const player2 = new Player(2, "Dinesh");

player1.setup(2, { x: 2, y: 2 });
player2.setup(3, { x: 3, y: 3 });

export const players = [player1, player2];

export const gameState = {
  players,
  currentPlayer: 2,
  board: {
    yarns: [
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
      [5, 4, 3, 2, 1],
      [1, 2, 3, 4, 5],
    ],
    tiles: [
      [
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: 1, playerId: null },
        { value: 2, playerId: null },
        { value: 3, playerId: null },
        { value: 4, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: 5, playerId: null },
        { value: 6, playerId: 1 },
        { value: 1, playerId: null },
        { value: 2, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: 3, playerId: null },
        { value: 4, playerId: null },
        { value: 5, playerId: 2 },
        { value: 6, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: 2, playerId: null },
        { value: 3, playerId: null },
        { value: 4, playerId: null },
        { value: 5, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
        { value: null, playerId: null },
      ],
    ],
  },
};

export const diceValue = {
  colorId: 1,
  number: 2,
};

export const tiles = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 2, 3, 4, 0],
  [0, 5, 6, 1, 2, 0],
  [0, 3, 4, 5, 6, 0],
  [0, 2, 3, 4, 5, 0],
  [0, 0, 0, 0, 0, 0],
];

export const yarns = [
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
];



export const actionTypes = {
  1: "Play action card",
  2: "Claim design card",
  3: "Roll dice",
  4: "Move pin",
  5: "Swap yarns",
  6: "Buy design card",
  7: "Buy action card",
  8: "Buy swap",
  9: "Exchange design card",
};
