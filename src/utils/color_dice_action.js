export const isInBoundary = (x, y, rows, columns) =>
  x <= rows && x >= 0 && y <= columns && y >= 0;

export const extractPlayersPositions = (players) => {
  const pinsPositions = {};
  players.forEach((player) => {
    pinsPositions[player.id] = Object.values(player.getPosition());
  });
  return pinsPositions;
};

export const mapAdjacentYarns = (pinsLocations, yarns) => {
  const pinYarns = {};
  const directions = [[0, 0], [0, -1], [-1, 0], [-1, -1]];
  const [rows, columns] = [yarns.length, yarns[0].length];
  Object.keys(pinsLocations).forEach((pinId) => {
    const [x, y] = pinsLocations[pinId];

    directions.forEach(([x1, y1]) => {
      pinYarns[pinId] = pinYarns[pinId] || [];
      if (isInBoundary(x + x1, y + y1, rows, columns)) {
        const yarn = yarns[x + x1][y + y1];
        pinYarns[pinId].push(yarn);
      }
    });
  });

  return pinYarns;
};

export const computeSettlement = (adjYarns, targetYarn) =>
  adjYarns.filter((yarn) => yarn === targetYarn).length;

export const createLedger = (adjYarnsMap, yarn) => {
  const ledger = {};

  Object.keys(adjYarnsMap).forEach((pinId) => {
    const yarns = adjYarnsMap[pinId];
    ledger[pinId] = computeSettlement(yarns, yarn);
  });

  return ledger;
};

export const computeExpense = (distributionConfig) =>
  Object.values(distributionConfig).reduce((a, b) => a + b, 0);

export const distributeTokens = (distributionConfig, players) => {
  Object.keys(distributionConfig).forEach((playerId) => {
    const player = players.find((player) => player.id === Number(playerId));
    player.creditTokens(distributionConfig[playerId]);
  });
};
