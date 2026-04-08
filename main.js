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
import { acMap, getActionCard } from "./src/utils/mock_data.js";

const main = () => {
  const player1 = new Player(1, "A");
  player1.setup(1, { x: -1, y: -1 });

  const player2 = new Player(2, "B");
  player2.setup(2, { x: -1, y: -1 });
  player1.addActionCard(getActionCard(acMap.move))
  player1.addActionCard(getActionCard(acMap.preset))
  player1.addActionCard(getActionCard(acMap.tax))
  player1.addActionCard(getActionCard(acMap.swap))
  player1.addActionCard(getActionCard(acMap.replace))
  player1.addActionCard(getActionCard(acMap.stealActionCard))
  player1.addActionCard(getActionCard(acMap.stealToken))
  player1.addActionCard(getActionCard(acMap.collectToken))
  player1.addActionCard(getActionCard(acMap.getDesignCard))
  
  player2.addActionCard(getActionCard(acMap.move))
  player2.addActionCard(getActionCard(acMap.preset))
  player2.addActionCard(getActionCard(acMap.tax))
  player2.addActionCard(getActionCard(acMap.swap))
  player2.addActionCard(getActionCard(acMap.replace))
  player2.addActionCard(getActionCard(acMap.stealActionCard))
  player2.addActionCard(getActionCard(acMap.stealToken))
  player2.addActionCard(getActionCard(acMap.collectToken))
  player2.addActionCard(getActionCard(acMap.getDesignCard))

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
