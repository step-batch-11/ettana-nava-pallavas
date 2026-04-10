const createGrid = (rows, cols) =>
  Array.from({ length: rows }, () => Array(cols).fill(null));

const getCount = (freq, val) => freq.get(val) || 0;

const inc = (freq, val) => freq.set(val, getCount(freq, val) + 1);
const dec = (freq, val) => freq.set(val, getCount(freq, val) - 1);

const canBePlaced = (grid, freq, row, col, val, maxTime) => {
  const top = row > 0 ? grid[row - 1][col] : null;
  const left = col > 0 ? grid[row][col - 1] : null;

  return (
    getCount(freq, val) < maxTime &&
    val !== top &&
    val !== left
  );
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const doesSatisfyMin = (freq, values, minTime = 0) =>
  values.every((v) => getCount(freq, v) >= minTime);

const isOnSide = (row, col, grid) =>
  row === 0 || col === 0 ||
  row === grid.length - 1 || col === grid.length - 1;

const fillGrid = (grid, freq, config, row = 0, col = 0) => {
  const { rows, cols, values, maxTime, type } = config;

  if (row === rows) return true;

  const nextRow = col === cols - 1 ? row + 1 : row;
  const nextCol = col === cols - 1 ? 0 : col + 1;

  for (const val of shuffle(values)) {
    if (!canBePlaced(grid, freq, row, col, val, maxTime)) continue;

    if (isOnSide(row, col, grid) && type === "tile") {
      grid[row][col] = 0;
    } else {
      grid[row][col] = val;
      inc(freq, val);
    }

    if (fillGrid(grid, freq, config, nextRow, nextCol)) return true;

    grid[row][col] = null;
    dec(freq, val);
  }

  return false;
};

export const generateValidGrid = (config) => {
  const { rows, cols, values, minTime = 0 } = config;

  while (true) {
    const grid = createGrid(rows, cols);
    const freq = new Map();

    if (!fillGrid(grid, freq, config)) continue;
    if (!doesSatisfyMin(freq, values, minTime)) continue;

    return { grid, freq };
  }
};

export const getKeysByValue = (elements, target) => {
  return [...elements.entries()]
    .filter(([_, v]) => v === target)
    .map(([x]) => x);
};
