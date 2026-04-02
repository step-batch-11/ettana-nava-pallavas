export const handleDiceRoll = (ctx) => {
  const turnManager = ctx.get("turnManager");
  const bank = ctx.get("bank");
  const diceValues = turnManager.rollDice();
  turnManager.processColorAction(diceValues.colorId, bank);
  const destinations = turnManager.findPossibleDestinations(diceValues.number);
  return ctx.json({ diceValues, destinations });
};

export const handleMove = async (ctx) => {
  const turnManager = ctx.get("turnManager");
  const destination = await ctx.req.json();
  const moveResult = turnManager.move(destination);
  const adjYarns = turnManager.getAdjYarnsPositions(moveResult.destination);
  if (moveResult.source === moveResult.destination) {
    return ctx.json({ success: false, message: "You can't move there" }, 400);
  }
  return ctx.json({
    success: true,
    data: { adjYarns, moveResult },
    message: "Moved successfully",
  }, 200);
};

export const handleSwap = async (ctx) => {
  const turnManager = ctx.get("turnManager");
  const { draggablePosition, yarnPosition } = await ctx.req.json();
  const swapResult = turnManager.freeSwap(draggablePosition, yarnPosition);
  if (!swapResult.success) {
    return ctx.json(
      { success: false, message: "You can't swap these yarns" },
      400,
    );
  }
  return ctx.json({
    success: true,
    message: "Swapped successfully",
  }, 200);
};
