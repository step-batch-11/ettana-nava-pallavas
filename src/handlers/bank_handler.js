export const serveBankState = (ctx) => {
  const bank = ctx.get("bank");
  const bankState = bank.getBank();

  return ctx.json(bankState);
};

export const buyDesignCard = (ctx) => {
  try {
    const bank = ctx.get("bank");
    const boardState = ctx.get("boardState");
    const currentPlayer = boardState.players.find((player) =>
      player.id === boardState.currentPlayer
    );

    if (currentPlayer.tokens < 3) {
      return ctx.json({
        success: false,
        message: "You do not have enough tokens",
      });
    }

    currentPlayer.tokens -= 3;
    const card = bank.buyDesignCard();
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
    const bank = ctx.get("bank");
    const boardState = ctx.get("boardState");
    const currentPlayer = boardState.players.find((player) =>
      player.id === boardState.currentPlayer
    );

    if (currentPlayer.tokens < 2) {
      return ctx.json({
        success: false,
        message: "You do not have enough tokens",
      });
    }
    currentPlayer.tokens -= 2;

    const card = bank.buyActionCard();
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
