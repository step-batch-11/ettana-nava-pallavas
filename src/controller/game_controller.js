import GameSetup from "../models/game_setup.js";
import { acMap, getActionCard } from "../utils/mock_data.js";

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

  buySpecificActionCard(cardId) {
    const currentPlayer = this.game.getCurrentPlayer();
    const ac = getActionCard(Number(cardId));
    currentPlayer.addActionCard(ac);
  }

  addTokensDev(tokenCount) {
    const currentPlayer = this.game.getCurrentPlayer();
    currentPlayer.creditTokens(tokenCount);
  }

  makeWin() {
    const currentPlayer = this.game.getCurrentPlayer();
    currentPlayer.updateVp(8);
    const currentPlayerVp = currentPlayer.getVp();

    if (currentPlayerVp >= 8) {
      this.game.setGameWon();
    }
  }

  getGameState(id) {
    return {
      ...this.game.getGameState(id),
      requesterId: id,
    };
  }

  getCurrentPlayerId() {
    return this.game.getCurrentPlayer().getId();
  }

  getGame() {
    return this.game;
  }

  move(destination) {
    const result = this.game.move(destination);

    this.playerActions.moved = true;
    this.playerActions.isLastMove = true;
    this.playerActions.anyActionDone = true;

    if (this.game instanceof GameSetup) this.changeGameSetupState();

    return result;
  }

  upkeep(id) {
    if (this.playerActions.diceRolled) {
      throw new Error("you can't roll again");
    }

    const result = this.game.upkeep();

    this.playerActions.diceRolled = true;
    this.playerActions.isLastMove = false;

    return { ...result, state: this.getGameState(id) };
  }

  freeSwap(position, yarn) {
    if (!this.playerActions.diceRolled || !this.playerActions.isLastMove) {
      throw new Error("swap has to be done immediately after move");
    }

    const result = this.game.freeSwap(position, yarn);

    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;

    return result;
  }

  buyDesignCard() {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy design card");
    }

    const result = this.game.buyDesignCard();

    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    this.game.storeLastAction("BUY_DC", this.game.getCurrentPlayer());
    return result;
  }

  buyActionCard() {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy action card");
    }

    const result = this.game.buyActionCard();

    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    this.game.storeLastAction("BUY_AC", this.game.getCurrentPlayer());

    return result;
  }

  claimDesign(id) {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to claim design");
    }

    const result = this.game.claimDesign(id);

    if (result.isMatched) {
      this.game.storeLastAction("CLAIM_DESIGN", this.game.getCurrentPlayer());
    }

    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    const currentPlayerVp = this.game.getCurrentPlayer().getVp();

    if (currentPlayerVp >= 8) this.game.setGameWon();

    return result;
  }

  buySwap() {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy swap");
    }

    const result = this.game.buySwap();

    return result;
  }

  paidSwap(position, yarn) {
    if (!this.playerActions.diceRolled) {
      throw new Error("roll and move to buy swap");
    }

    const result = this.game.paidSwap(position, yarn);

    this.playerActions.isLastMove = false;
    this.playerActions.anyActionDone = true;
    this.game.storeLastAction("PAID_SWAP", this.game.getCurrentPlayer());

    return result;
  }

  canActionBeDone(cardId) {
    if (cardId === 1) {
      return !this.playerActions.moved && this.playerActions.diceRolled;
    }

    if (cardId === 13) {
      return !this.playerActions.diceRolled && this.game.state === "game";
    }

    if (cardId === 28) {
      return this.playerActions.diceRolled && !this.playerActions.anyActionDone;
    }

    return this.playerActions.diceRolled;
  }

  playCard(cardId) {
    if (!this.canActionBeDone(cardId)) {
      throw new Error("action card can't be played");
    }

    if (cardId === 28 || cardId === 31) {
      this.playerActions.diceRolled = false;
    }

    const result = this.actionCardService.playCard(cardId, this.game);

    this.playerActions.anyActionDone = true;
    this.playerActions.isLastMove = false;

    const victoryPointId = acMap.victoryPoint;
    const currentPlayerVp = this.game.getCurrentPlayer().getVp();

    if (cardId === victoryPointId && currentPlayerVp >= 8) {
      this.game.setGameWon();
    }

    return result;
  }

  performAction(payload) {
    const cardId = Number(payload.cardId);

    if (!this.canActionBeDone(cardId)) {
      throw new Error("action card can't be played");
    }

    const result = this.actionCardService.performAction(payload, this.game);

    if (cardId === 1) {
      this.playerActions.moved = true;
      this.playerActions.isLastMove = true;
    }

    if (cardId === 13) {
      this.playerActions.diceRolled = true;
    }

    this.playerActions.anyActionDone = true;

    return result;
  }

  endTurn(requesterId) {
    if (!this.playerActions.diceRolled || !this.playerActions.moved) {
      throw new Error("roll and move to end turn");
    }

    const currentPlayer = this.game.getCurrentPlayer();
    const result = this.game.next(requesterId);

    this.playerActions = { ...this.#defaultActions };
    this.game.storeLastAction("PASS_TURN", currentPlayer);

    return result;
  }

  changeGameSetupState() {
    this.game = this.game.next();
    this.playerActions = { ...this.#defaultActions };
  }

  exchangeDesignCard(designCardId, requesterId) {
    if (this.playerActions.anyActionDone || !this.playerActions.diceRolled) {
      throw new Error(
        "exchange design card only after dice roll and before any action.",
      );
    }

    this.game.exchangeDesignCard(designCardId);
    const result = this.game.next(requesterId);

    this.playerActions = { ...this.#defaultActions };

    return result;
  }

  rotateDesignCard(designCardId, requesterId) {
    this.game.rotatePattern(designCardId, requesterId);
    return { state: this.getGameState(requesterId) };
  }
}
