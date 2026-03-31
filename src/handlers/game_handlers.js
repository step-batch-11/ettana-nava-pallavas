export const serveBoardState = (ctx) => {
  try {
    const board = ctx.get("boardState");
    return ctx.json({ success: true, state: board });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

export const distributeInitialAssets = (ctx) => {
  try {
    const bank = ctx.get("bank");
    const board = ctx.get("boardState");

    bank.distributeInitialAssets(board.players);

    return ctx.json({
      success: true,
      message: "Initial assets are distributed among players",
    });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};
