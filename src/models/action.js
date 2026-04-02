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

export const tax = (game, bank) => {
  let tokens = 0;
  game.players.forEach((player) => {
    if (player.id !== game.currentPlayer && player.tokens > 0) {
      player.tokens -= 1;
      tokens++;
    }
  });

  bank.incrementTokens(tokens);
};
