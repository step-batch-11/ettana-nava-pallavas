import { createApp } from "./src/app.js";
import designCards from "./src/config/design_card.json" with { type: "json" };
import actionCards from "./src/config/action_card.json" with { type: "json" };

const players = [
  {
    name: "Sandip",
    id: 1,
    availabeToken: 0,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 1, pos: { x: 3, y: 4 } },
  },
  {
    name: "Ajoy",
    id: 2,
    availabeToken: 0,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 2, pos: { x: 2, y: 1 } },
  },
  {
    name: "Dinesh",
    id: 3,
    availabeToken: 0,
    victoryPoint: 0,
    actionCards: [],
    designCards: [],
    pin: { color: 3, pos: { x: 4, y: 1 } },
  },
];

const gameState = {
  players,
  currentPlayer: {
    playerId: 1,
    pin: {
      position: { x: 1, y: 1 },
      color: 1,
    },
  },
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
        { value: 1, playerId: 1 },
        { value: 2, playerId: null },
        { value: 3, playerId: null },
        { value: 4, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: 5, playerId: null },
        { value: 6, playerId: 2 },
        { value: 1, playerId: null },
        { value: 2, playerId: null },
        { value: null, playerId: null },
      ],
      [
        { value: null, playerId: null },
        { value: 3, playerId: null },
        { value: 4, playerId: null },
        { value: 5, playerId: 3 },
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

const bank = {
  tokens: 55,
  availableDesignCards: designCards,
  availableActionCards: actionCards,
  yarns: [1, 2, 3, 4, 5],
  tiles: [{ value: 1, playerId: null }, { value: 6, playerId: null }],
};

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp(gameState, bank);
  Deno.serve({ port: PORT }, app.fetch);
};

main();
