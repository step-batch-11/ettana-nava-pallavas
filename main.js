import designCards from "./src/config/design_card.json" with { type: "json" };
import actionCards from "./src/config/action_card.json" with { type: "json" };
import Bank from "./src/models/bank.js";
import Game from "./src/models/game.js";
import Board from "./src/models/board.js";
import { createApp } from "./src/app.js";
import { diceValue, tiles, yarns } from "./src/data/state.js";
import TurnManager from "./src/models/turn_manager.js";
import Player from "./src/models/player.js";

const main = () => {
  const player1 = new Player(1, "Ajoy");
  player1.setup(1, { x: 1, y: 1 });

  player1.addAllDesignCardDev(...designCards);
  player1.addActionCard({
    id: 6,
    "type": "tax",
    "description": "Other player will give 1 token to bank",
  });

  const player2 = new Player(2, "Dinesh");
  player2.setup(2, { x: 3, y: 3 });

  const game = new Game(
    [player1, player2],
    new Bank(designCards, actionCards),
    new Board(tiles, yarns),
    diceValue,
  );
  game.distributeInitialAssets();
  const turnManager = new TurnManager(game, Math.random);

  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp(game, turnManager);
  Deno.serve({ port: PORT }, app.fetch);
};

main();
