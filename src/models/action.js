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
