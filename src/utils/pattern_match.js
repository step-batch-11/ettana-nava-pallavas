const normalize = (pattern) => {
  const minX = Math.min(...pattern.map((p) => p.coord.x));
  const minY = Math.min(...pattern.map((p) => p.coord.y));

  return pattern.map((p) => ({
    coord: {
      x: p.coord.x - minX,
      y: p.coord.y - minY,
    },
    color: p.color,
  }));
};

export const generatePatternGrid = (pattern) => {
  const normalized = normalize(pattern);

  const maxX = Math.max(...normalized.map((p) => p.coord.x));
  const maxY = Math.max(...normalized.map((p) => p.coord.y));

  const grid = Array.from(
    { length: maxX + 1 },
    () => Array.from({ length: maxY + 1 }).fill(null),
  );

  normalized.forEach(({ coord, color }) => {
    grid[coord.x][coord.y] = color;
  });

  return grid;
};

const extractPoints = (grid) => {
  const points = [];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      const color = grid[row][col];
      if (color !== null) points.push({ x: row, y: col, color });
    }
  }

  return points;
};

const matchesAt = (yarns, points, startX, startY) => {
  const colorToYarn = {};
  const yarnToColor = {};
  const coords = [];

  for (const { x, y, color } of points) {
    const boardX = x + startX;
    const boardY = y + startY;
    const yarn = yarns[boardX][boardY];

    if (color in colorToYarn) {
      if (colorToYarn[color] !== yarn) return null;
    } else {
      colorToYarn[color] = yarn;
    }

    if (yarn in yarnToColor) {
      if (yarnToColor[yarn] !== color) return null;
    } else {
      yarnToColor[yarn] = color;
    }

    coords.push({ x: boardX, y: boardY });
  }

  return coords;
};

export const doesPatternMatch = (yarns, grid) => {
  const points = extractPoints(grid);

  const maxX = Math.max(...points.map((p) => p.x));
  const maxY = Math.max(...points.map((p) => p.y));

  const boardHeight = yarns.length;
  const boardWidth = yarns[0].length;

  for (let i = 0; i < boardHeight - maxX; i++) {
    for (let j = 0; j < boardWidth - maxY; j++) {
      const result = matchesAt(yarns, points, i, j);
      if (result) return result;
    }
  }

  return null;
};

const transpose = (matrix) =>
  matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));

const reverse = (matrix) => matrix.map((row) => row.toReversed());

export const rotate = (matrix) => reverse(transpose(matrix));

export const rotateDesign = (pattern, size = 5) => {
  return pattern.map(({ coord, color }) => ({
    coord: {
      x: coord.y,
      y: size - 1 - coord.x,
    },
    color,
  }));
};
