export const buyDesignCard = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const currentPlayer = game.players.find((player) =>
      player.id === game.currentPlayer
    );

    if (currentPlayer.tokens < 3) { //method -> Player class
      return ctx.json({
        success: false,
        message: "You do not have enough tokens",
      });
    }

    currentPlayer.tokens -= 3; //method -> Player class
    const card = game.bank.buyDesignCard();
    currentPlayer.designCards.push(card);

    return ctx.json({
      success: true,
      message: "Design card bought successfully",
    });
  } catch (err) {
    return ctx.json({ success: false, message: err.message });
  }
};

export const buyActionCard = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const currentPlayer = game.players.find((player) =>
      player.id === game.currentPlayer
    );

    if (currentPlayer.tokens < 2) {
      return ctx.json({
        success: false,
        message: "You do not have enough tokens",
      });
    }
    currentPlayer.tokens -= 2;

    const card = game.bank.buyActionCard();
    currentPlayer.actionCards.push(card);

    return ctx.json({
      success: true,
      card,
      message: "Action card bought successfully",
    });
  } catch (err) {
    return ctx.json({ success: false, message: err.message });
  }
};
