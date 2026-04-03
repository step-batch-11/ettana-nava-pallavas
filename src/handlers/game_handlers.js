export const serveGameState = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const gameState = game.getGameState();

    return ctx.json({
      success: true,
      state: gameState,
    });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

export const buyDesignCard = (ctx) => {
  try {
    const game = ctx.get("gameState");
    const card = game.buyDesignCard();

    if (card === "NOT_ENOUGH_TOKEN") {
      return ctx.json({
        message: "You do not have enough tokens",
        success: false,
      });
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
      return ctx.json({
        message: "You do not have enough tokens",
        success: false,
      });
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

export const playActionCard = async (context) => {
  try {
    const game = context.get("gameState");
    const id = await context.req.param("id");

    const actionCardHandlers = {
      6: (id) => game.playTaxActionCard(id),
    };

    if (id in actionCardHandlers) {
      const { affectedPlayers, gameState } = game.playTaxActionCard(id);

      return context.json({
        affectedPlayers,
        gameState,
        success: true,
        message: "Tax action card played",
      });
    }

    return context.json(
      { success: false, message: "Invalid action card" },
      400,
    );
  } catch (err) {
    return context.json({ success: false, message: err.message }, 400);
  }
};
