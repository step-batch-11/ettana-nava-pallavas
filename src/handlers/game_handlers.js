export const serveBoardState = (ctx) => {
  try {
    const board = ctx.get("boardState");
    return ctx.json({ success: true, state: board });
  } catch (e) {
    return ctx.json({ success: false, error: e.message });
  }
};

// export const _distributeInitialAssets = (ctx) => {
//   try {
//     const _bank = ctx.get("bank");
//     const _board = ctx.get("boardState");
//   } catch (e) {
//     return ctx.json({ success: false, error: e.message });
//   }
// };
