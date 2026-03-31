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
  return ctx.json({ adjYarns, positions });
};
