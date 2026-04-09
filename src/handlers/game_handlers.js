import { errorResponse } from "../utils/util.js";

export const serveGameState = (ctx) => {
  try {
    const room = ctx.get("room");
    const session = ctx.get("session");

    const gameState = room.state.getGameState(session.playerId);
    return ctx.json({
      success: true,
      state: gameState,
    });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const handleDiceRoll = (context) => {
  try {
    const session = context.get("session");
    const room = context.get("room");

    const { diceValues, destinations } = room.state.upkeep(session.playerId);
    const gameState = room.state.getGameState(session.playerId);
    return context.json({ success: true, gameState, destinations, diceValues });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const buyDesignCard = (context) => {
  try {
    const room = context.get("room");
    const card = room.state.buyDesignCard();

    return context.json({
      success: true,
      card,
      message: "Design card bought successfully",
    });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const buyActionCard = (context) => {
  try {
    const room = context.get("room");

    const card = room.state.buyActionCard();
    return context.json({
      success: true,
      card,
      message: "Action card bought successfully",
    });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const claimDesign = (context) => {
  try {
    const designCardId = context.req.param("id");
    const room = context.get("room");
    const session = context.get("session");

    const result = room.state.claimDesign(designCardId);
    const gameState = room.state.getGameState(session.playerId);
    return context.json({ success: true, result, state: gameState });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const handleMove = async (context) => {
  try {
    const destination = await context.req.json();
    const room = context.get("room");

    const result = room.state.move(destination);
    return context.json(
      { success: true, result: { ...result, message: "Moved successfully" } },
      200,
    );
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const handleSwap = async (context) => {
  try {
    const { draggablePosition, yarnPosition } = await context.req.json();
    const room = context.get("room");

    room.state.freeSwap(draggablePosition, yarnPosition);
    return context.json(
      { success: true, message: "Swapped successfully" },
      200,
    );
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const handlePaidSwap = async (context) => {
  try {
    const room = context.get("room");
    const { draggablePosition, yarnPosition } = await context.req.json();
    room.state.paidSwap(draggablePosition, yarnPosition);

    return context.json(
      { success: true, message: "Swapped successfully" },
      200,
    );
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const playActionCard = (context) => {
  try {
    const room = context.get("room");
    const session = context.get("session");
    const cardId = Number(context.req.param("id"));

    const result = room.state.playCard(cardId);
    const state = room.state.getGameState(session.playerId);

    return context.json({ result, state, success: true });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const performActionCard = async (context) => {
  try {
    const room = context.get("room");
    const session = context.get("session");
    const payload = await context.req.json();

    const result = room.state.performAction(payload);
    const state = room.state.getGameState(session.playerId);

    return context.json({ result, state, success: true });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const rotateDesignCard = (context) => {
  try {
    const room = context.get("room");
    const id = Number(context.req.param("id"));
    const session = context.get("session");
    const { state } = room.state.rotateDesignCard(id, session.playerId);

    return context.json({ state, message: "Rotated", success: true });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const exchangeDesignCard = (context) => {
  try {
    const room = context.get("room");
    const session = context.get("session");
    const id = Number(context.req.param("id"));

    room.state.exchangeDesignCard(id, session.playerId);
    const state = room.state.getGameState(session.playerId);

    return context.json({
      state,
      result: { message: "Design card exchanged successfully" },
      success: true,
    });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const passTurn = (context) => {
  try {
    const room = context.get("room");
    const session = context.get("session");

    const { state } = room.state.endTurn(session.playerId);
    return context.json({
      result: { message: "turn passed" },
      state,
      success: true,
    });
  } catch (error) {
    return errorResponse(context, error);
  }
};

export const handleBuySwap = (context) => {
  try {
    const room = context.get("room");

    return context.json({ success: true, result: room.state.buySwap() });
  } catch (err) {
    return context.json({ success: false, error: err.message }, 400);
  }
};
