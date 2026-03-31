export const handleDiceRoll = (ctx) => {
  const turnManager = ctx.get("turnManager");
  const diceValues = turnManager.rollDice();
  const destinations = turnManager.findPossibleDestinations(diceValues.number);
  return ctx.json({ diceValues, destinations });
};

export const handleMove = async (ctx) => {
  const turnManager = ctx.get("turnManager");
  const { destination } = await ctx.req.json();
  const newPosition = turnManager.move(destination);
  const adjYarnsPositions = turnManager.getAdjYarnsPositions(newPosition);
  return ctx.json({ adjYarnsPositions, newPosition });
};
