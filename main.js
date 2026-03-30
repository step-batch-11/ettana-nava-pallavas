import { createApp } from "./src/app.js";

export const gameState = {
  players: [
    {
      playerId: 1,
      pin: {
        position: { x: 1, y: 1 },
        color: 1,
      },
    },
    {
      playerId: 2,
      pin: {
        position: { x: 2, y: 2 },
        color: 2,
      },
    },
    {
      playerId: 3,
      pin: {
        position: { x: 3, y: 3 },
        color: 3,
      },
    },
    {
      playerId: 4,
      pin: {
        position: { x: 4, y: 4 },
        color: 4,
      },
    },
  ],
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
        { value: 5, playerId: 4 },
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

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;

  const app = createApp(gameState);

  Deno.serve({ port: PORT }, app.fetch);
};

main();
