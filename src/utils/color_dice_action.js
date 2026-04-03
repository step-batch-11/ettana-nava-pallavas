const YARN_ROWS = 4;
const YARN_COLUMNS = 4;

export const isValidPosition = ({ x, y }) => {
  return x <= YARN_ROWS && x >= 0 && y <= YARN_COLUMNS && y >= 0;
};

export const findAdjacentYarns = (position) => {
  const topLeft = { x: position.x - 1, y: position.y - 1 };
  const topRight = { x: position.x - 1, y: position.y };
  const bottomLeft = { x: position.x, y: position.y - 1 };
  const bottomRight = { x: position.x, y: position.y };

  return [topLeft, topRight, bottomLeft, bottomRight].filter(isValidPosition);
};

export const settelement = (player, color, yarns) => {
  const position = player.getPosition();
  const eligibleYarns = findAdjacentYarns(position)
    .filter(({ x, y }) => yarns[x][y] === color);

  return eligibleYarns.length;
};

export const createLedger = (color, players, yarns) => {
  const ledger = {};
  players.forEach((player) => {
    ledger[player.getId()] = settelement(player, color, yarns);
  });
  return ledger;
};
