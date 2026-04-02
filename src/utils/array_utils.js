export const identity = (arg) => arg;

export const toFrequencyMap = (elements, keyFn = identity) =>
  elements.reduce((acc, element) => {
    const key = keyFn(element);
    const count = acc[key] || 0;
    acc[key] = count + 1;
    return acc;
  }, {});
