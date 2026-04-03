export const handleDiceRoll = (ctx) => {
  const turnManager = ctx.get("turnManager");
  const { bank, board, players, currentPlayerId } = (ctx.get("gameState"))
    .getGameState();

  const player = players.find((player) => player.id === currentPlayerId);
  console.log(game.getGameState());
  const diceValues = turnManager.rollDice();
  turnManager.processColorAction(
    diceValues.colorId,
    bank,
  );
  const destinations = board.findPossibleDestinations(
    player,
    players,
    diceValues.number,
  );
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
  const gameState = ctx.get("gameState");

  const { draggablePosition, yarnPosition } = await ctx.req.json();
  try {
    gameState.freeSwap(draggablePosition, yarnPosition);

    return ctx.json({
      success: true,
      message: "Swapped successfully",
    }, 200);
  } catch (e) {
    return ctx.json(
      { success: false, message: e.message },
      400,
    );
  }
};
