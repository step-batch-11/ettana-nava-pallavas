import GameSetup from "../models/game_setup.js";

export default class GameController {
  #defaultActions = {
    moved: false,
    preset: false,
    diceRolled: false,
    isLastMove: false,
    anyActionDone: false,
  };

  constructor(game, actionCardService) {
    this.playerActions = { ...this.#defaultActions };
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
    const result = this.game.move(destination);
    this.playerActions.moved = true;
    this.playerActions.isLastMove = true;
    this.playerActions.anyActionDone = true;
    if (this.game instanceof GameSetup) this.changeGameSetupState();

    return result;
  }

  upkeep() {
    if (this.playerActions.diceRolled) {
      throw new Error("you can't roll again");
    }
    this.playerActions.diceRolled = true;
    this.playerActions.isLastMove = false;
    return this.game.upkeep();
  }

  freeSwap(position, yarn) {
    if (!this.playerActions.diceRolled || !this.playerActions.isLastMove) {
      throw new Error("swap has to be done immediately after move");
    }
    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    return this.game.freeSwap(position, yarn);
  }

  buyDesignCard() {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy design card");
    }
    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    return this.game.buyDesignCard();
  }

  buyActionCard() {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy action card");
    }
    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    return this.game.buyActionCard();
  }

  claimDesign(id) {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to claim design");
    }
    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    return this.game.claimDesign(id);
  }

  paidSwap(position, yarn) {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy swap");
    }
    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    return this.game.paidSwap(position, yarn);
  }

  canActionBeDone(cardId) {
    if (cardId === 1) {
      return !this.playerActions.moved;
    }
    return this.playerActions.diceRolled;
  }

  playCard(cardId) {
    if (!this.canActionBeDone(cardId)) {
      throw new Error("action card can't be played");
    }

    this.playerActions.anyActionDone = true;
    return this.actionCardService.playCard(cardId, this.game);
  }

  performAction(payload) {
    if (!this.canActionBeDone(payload.cardId)) {
      throw new Error("action card can't be played");
    }

    this.playerActions.isLastMove = payload.cardId === 1;
    this.playerActions.moved = payload.cardId === 1;

    this.playerActions.anyActionDone = true;
    return this.actionCardService.performAction(payload, this.game);
  }

  endTurn() {
    if (!this.playerActions.diceRolled || !this.playerActions.moved) {
      throw new Error("roll and move to end turn");
    }
    this.playerActions = { ...this.#defaultActions };
    return this.game.next();
  }

  changeGameSetupState() {
    this.game = this.game.next();
    this.playerActions = { ...this.#defaultActions };
  }

  exchangeDesignCard(designCardId) {
    if (this.playerActions.anyActionDone || !this.playerActions.diceRolled) {
      throw new Error("exchange design card should happen before any action");
    }

    this.game.exchangeDesignCard(designCardId);

    this.playerActions = { ...this.#defaultActions };
    return this.game.next();
  }
}
