import Game from "../models/game.js";
import GameSetup from "../models/game_setup.js";

export default class GameController {
  #defaultActions = {
    moved: false,
    preset: false,
    diceRolled: false,
    anyAction: false,
  };

  constructor(game, actionCardService) {
    this.playerActions = this.#defaultActions;
    this.game = game;
    this.actionCardService = actionCardService;
  }

  getGame() {
    return this.game;
  }

  getGameState(_id) {
    const currentPlayer = this.game.getCurrentPlayer();
    return this.game.getGameState(currentPlayer.getId());
  }

  move(destination) {
    this.playerActions.moved = true;
    const result = this.game.move(destination);
    if (this.game instanceof GameSetup) this.changeGameSetupState();
    if (this.game instanceof Game) this.endTurn();

    return result;
  }

  upkeep() {
    this.playerActions.diceRolled = true;
    return this.game.upkeep();
  }

  freeSwap(position, yarn) {
    return this.game.freeSwap(position, yarn);
  }

  buyDesignCard() {
    return this.game.buyDesignCard();
  }

  buyActionCard() {
    return this.game.buyActionCard();
  }

  claimDesign(id) {
    return this.game.claimDesign(id);
  }

  paidSwap(position, yarn) {
    return this.game.paidSwap(position, yarn);
  }

  endTurn() {
    if (!this.playerActions.diceRolled || !this.playerActions.moved) {
      throw new Error("roll and move to end turn");
    }
    return this.game.next();
  }

  changeGameSetupState() {
    this.game = this.game.next();
    this.playerActions = this.#defaultActions;
  }
}
