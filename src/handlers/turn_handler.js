export const handleDiceRoll = (ctx) => {
  const turnManager = ctx.get("turnManager");
  const diceValues = turnManager.rollDice();
  const destinations = turnManager.findPossibleDestinations(diceValues.number);
  return ctx.json({ diceValues, destinations });
};
