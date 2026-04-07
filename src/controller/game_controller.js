export default class GameController {
  constructor(game, actionCardService) {
    this.game = game;
    this.actionCardService = actionCardService;
  }

  getGame() {
    return this.game;
  }

  getGameState() {
    return this.game.getGameState();
  }

  move(destination) {
    const result = this.game.move(destination);
    if (this.game.state === "game-setup") this.next();

    return result;
  }

  upkeep() {
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

  next() {
    this.game = this.game.next();
  }
}
