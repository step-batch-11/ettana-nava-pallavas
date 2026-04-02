export const players = [
  {
    name: "Ajoy",
    id: 1,
    tokens: 0,
    roomId: null,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 2, position: { x: 2, y: 2 } },
  },
  {
    name: "Dinesh",
    id: 2,
    tokens: 90,
    roomId: null,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 3, position: { x: 3, y: 3 } },
  },
];

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
