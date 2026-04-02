export const buyDesignCard = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const card = game.buyDesignCard();

    if (card === "NOT_ENOUGH_TOKEN") {
      return {
        message: "You do not have enough tokens",
        success: false,
      };
    }

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
    const card = game.buyActionCard();

    if (card === "NOT_ENOUGH_TOKEN") {
      return {
        message: "You do not have enough tokens",
        success: false,
      };
    }

    return ctx.json({
      success: true,
      card,
      message: "Action card bought successfully",
    });
  } catch (err) {
    return ctx.json({ success: false, message: err.message });
  }
};
