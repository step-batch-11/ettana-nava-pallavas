export const rollDice = async () => {
  const response = await fetch("/game/roll", {
    method: "POST",
  });
  return response.json();
};

export const getGameState = async () => {
  const res = await fetch("/game/game-state");
  const { state } = await res.json();
  return state;
};

export const claimDesignCard = async (id) => {
  const res = await fetch(`/game/claim-design/${id}`);
  return res.json();
};

export const playVpActionCard = async (id) => {
  const res = await fetch(`/game/action-card/${id}`, { method: "PATCH" });
  return res.json();
};

export const sendRequest = async (path) => {
  const response = await fetch(path);
  return await response.json();
};
