export const rollDice = async () => {
  const response = await fetch("/game/roll", {
    method: "POST",
  });
  return await response.json();
};

export const getGameState = async () => {
  const res = await fetch("/game/game-state");
  const { state } = await res.json();
  return state;
};
