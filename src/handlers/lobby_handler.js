import Player from "../models/player.js";

export const handleJoinLobby = async (context) => {
  try {
    const lobbyController = context.get("lobbyController");
    const payload = await context.req.formData();

    const player = new Player(Date.now(), payload.get("username"));
    const { id } = lobbyController.enterLobby(player);

    return context.json({
      success: true,
      message: "Joined successfully",
      state: lobbyController.getLobbyState(),
      id: id,
    });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};

export const handleGetLobbyState = (context) => {
  try {
    const lobbyController = context.get("lobbyController");
    return context.json({
      success: true,
      state: lobbyController.getLobbyState(),
    });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};

export const handleExitLobby = (context) => {
  try {
    const lobbyController = context.get("lobbyController");
    const id = context.req.param("id");
    console.log({ id });

    lobbyController.exitLobby(id);
    return context.json({ success: true, message: "You left the lobby" });
  } catch (err) {
    return context.json({ success: false, error: err.message });
  }
};
