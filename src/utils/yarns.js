import {areSamePositions, doesConsist} from './common.js'

export const areYarnsSwappable = (source, destination, allSwappableYarns) => {
  return !areSamePositions(source, destination) &&
    doesConsist(destination, allSwappableYarns) &&
    doesConsist(source, allSwappableYarns);
};

