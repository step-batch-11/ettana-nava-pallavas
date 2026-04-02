import { tax } from "../models/action.js";

const handlers = {
  19: tax,
};

export const handleActionCard = async (context) => {
  const id = await context.req.param("id");
  const game = context.get("gameState");

  if (id in handlers) {
    handlers[id](game, id);
    return context.json({
      success: true,
      message: "Tax action card played successfully",
    }, 200);
  }

  return context.json({ success: false, error: "Invalid action card" }, 400);
};
