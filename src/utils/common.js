export const areSamePositions = ({ x: x1, y: y1 }, { x: x2, y: y2 }) =>
  x1 === x2 && y1 === y2;

export const doesConsist = (target, locations) => {
  return locations.some((location) => areSamePositions(target, location));
};

export const isValidPosition = ({ x, y }, grid) => {
  const rows = grid.length;
  const columns = grid[0].length;

  return x >= 0 && x < rows && y >= 0 && y < columns;
};

export const randomBw = (max, min = 0, randomFn = Math.random) =>
  Math.floor(min + randomFn() * (max - min));

export const updatePlayerCards = (player, card, newCard) => {
  player.removeActionCard(card.id);
  player.addActionCard(newCard);
};
