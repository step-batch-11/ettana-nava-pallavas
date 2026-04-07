import designCards from "./src/config/design_card.json" with { type: "json" };
import actionCards from "./src/config/action_card.json" with { type: "json" };
import Bank from "./src/models/bank.js";
import Board from "./src/models/board.js";
import { createApp } from "./src/app.js";
import { tiles, yarns } from "./src/data/state.js";
import Player from "./src/models/player.js";
import GameSetup from "./src/models/game_setup.js";
import GameController from "./src/controller/game_controller.js";
import ActionCardService from "./src/service/action_card.js";
import { Lobby } from "./src/models/lobby.js";

const main = () => {
  const player1 = new Player(1, "A");
  player1.setup(1, { x: -1, y: -1 });
  
  const player2 = new Player(2, "B");
  player2.setup(2, { x: -1, y: -1 });

  const gameState = new GameSetup(
    [player1, player2],
    new Bank(designCards, actionCards),
    new Board(tiles, yarns),
  );
  const actionCardService = new ActionCardService();
  const gameController = new GameController(gameState, actionCardService);

  const lobbyController = new Lobby(1);
  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp(
    gameState,
    gameController,
    actionCardService,
    lobbyController,
  );
  Deno.serve({ port: PORT }, app.fetch);
};

main();
