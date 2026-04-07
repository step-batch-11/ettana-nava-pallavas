import Player from "../models/player.js";

export const handleJoinLobby = async (context) => {
  try {
    const lobbyController = context.get("lobbyController");
    const payload = await context.req.formData();

    const player = new Player(Date.now(), payload.get("username"));
    lobbyController.enterLobby(player);

    return context.json({
      success: true,
      message: "Joined successfully",
      state: lobbyController.getState(),
    });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};

export const handleGetLobbyState = (context) => {
  try {
    const lobbyController = context.get("lobbyController");

    return { success: true, state: lobbyController.getState() };
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};
