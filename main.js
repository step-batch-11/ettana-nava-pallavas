import designCards from "./src/config/design_card.json" with { type: "json" };
import actionCards from "./src/config/action_card.json" with { type: "json" };
import Bank from "./src/models/bank.js";
import Game from "./src/models/game.js";
import Board from "./src/models/board.js";
import { createApp } from "./src/app.js";
import { diceValue, players, tiles, yarns } from "./src/data/state.js";
import TurnManager from "./src/models/turn_manager.js";

const main = () => {
  const gameState = new Game(
    players,
    new Bank(designCards, actionCards),
    new Board(tiles, yarns),
    diceValue,
  );

  gameState.distributeInitalAssets(players);

  const turnManager = new TurnManager(gameState, Math.random);

  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp(gameState, turnManager);
  Deno.serve({ port: PORT }, app.fetch);
};

main();
