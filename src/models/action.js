export const movePin = (players, _currentPlayer) => {
  const positions = [];
  const pos = players.map((player) => player.pin.position);

  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      if (!pos.find((p) => p.x === row && p.y === col)) {
        positions.push({ x: row, y: col });
      }
    }
  }

  return positions;
};

export const removeCard = (player, id) => {
  const index = player.actionCards.findIndex((card) => card.id === id);
  player.actionCards.splice(index, 1);
};

export const tax = (game, id) => {
  let tokens = 0;
  game.players.forEach((player) => {
    if (player.id !== game.currentPlayer && player.tokens > 0) {
      player.tokens -= 1;
      tokens++;
    }
  });

  const currentPlayer = game.players.find((player) =>
    player.id === game.currentPlayer
  );

  removeCard(currentPlayer, id);
  game.bank.incrementTokens(tokens);
};
