export const rollDice = async () => {
  const response = await fetch("/game/roll", {
    method: "POST",
    credentials: "include",
  });
  return response.json();
};

export const getGameState = async () => {
  const res = await fetch("/game/game-state", { credentials: "include" });
  const { state } = await res.json();
  return state;
};

export const claimDesignCard = async (id) => {
  const res = await fetch(`/game/claim-design/${id}`, {
    credentials: "include",
  });
  return res.json();
};

export const playActionCard = async (id) => {
  const res = await fetch(`/game/action-card/${id}`, {
    method: "PATCH",
    credentials: "include",
  });
  return res.json();
};

export const sendRequest = async (path) => {
  const response = await fetch(path, { credentials: "include" });
  return await response.json();
};

export const changeTurnRequest = async (path) => {
  const response = await fetch(path, { method: "POST" });
  return await response.json();
};
