export const pickRandom = (patterns, randomFn = Math.random) => {
  return Math.floor(randomFn() * patterns.length);
};

export const shuffle = (patterns, randomFn = pickRandom) => {
  const shuffled = [...patterns];

  for (let pointer = 0; pointer < shuffled.length; pointer++) {
    const randomIndex = randomFn(patterns);
    const temp = shuffled[randomIndex];
    shuffled[randomIndex] = shuffled[pointer];
    shuffled[pointer] = temp;
  }

  return shuffled;
};
