export const validateTileWithBank = (boardTiles, bankTiles) => {
  const flatTiles = boardTiles.flat();

  const counts = {};
  for (const tile of flatTiles) {
    if (tile.value === null) continue;
    counts[tile.value] = (counts[tile.value] || 0) + 1;
  }

  return bankTiles.some(({ value }) => counts[value] !== 2);
};

export const serveBoardState = (ctx) => {
  try {
    const board = ctx.get("boardState");
    const bank = ctx.get("bank");

    const _bankInfo = bank.getBank();

    // if (validateTileWithBank(board.board.tiles, tiles)) {
    //   return ctx.json({ success: false, error: "Tiles placement is wrong" });
    // }

    return ctx.json({
      success: true,
      state: board,
    });
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
