export const handleDiceRoll = (ctx) => {
  const turnManager = ctx.get("turnManager");
  const diceValues = turnManager.rollDice();
  const destinations = turnManager.findPossibleDestinations(diceValues.number);

  return ctx.json({ diceValues, destinations });
};

export const handleMove = async (ctx) => {
  const turnManager = ctx.get("turnManager");
  const destination = await ctx.req.json();
  const positions = turnManager.move(destination);
  const adjYarns = turnManager.getAdjYarnsPositions(positions.destination);
  if (positions.source === positions.destination) {
    return ctx.json({ success: false, message: "You can't move there" }, 400);
  }
  return ctx.json({
    success: true,
    data: { adjYarns, positions },
    message: "Moved successfully",
  }, 200);
};
