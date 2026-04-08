import designCards from "../../src/config/design_card.json" with {
  type: "json",
};
import actionCards from "../../src/config/action_card.json" with {
  type: "json",
};

export const mockTiles = () => [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 2, 3, 4, 0],
  [0, 5, 6, 1, 2, 0],
  [0, 3, 4, 5, 6, 0],
  [0, 2, 3, 4, 5, 0],
  [0, 0, 0, 0, 0, 0],
];

export const mockYarns = () => [
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
  [5, 4, 3, 2, 1],
  [1, 2, 3, 4, 5],
];

export const getAllDesignCard = () => designCards;
export const getAllActionCard = () => actionCards;

export const getDesignCard = (id) => designCards.find((card) => card.id === id);
export const getActionCard = (id) => actionCards.find((card) => card.id === id);

export const acMap = {
  "move": 1,
  "collectToken": 4,
  "tax": 6,
  "getDesignCard": 7,
  "preset": 13,
  "victoryPoint": 16,
  "gainToken": 31,
  "replace": 34,
};

export const isPresent = (deck, card) => deck.some(({ id }) => id === card.id);
