const getPlayerId = (grid, position) => {
  return grid[position.x][position.y].playerId;
};

export const isInBoundary = ({ x, y }, rows, columns) => {
  return x > -1 && x < rows && y > -1 && y < columns;
};

export const getBoundary = (grid) => {
  const rows = grid.length;
  const columns = grid[0].length;

  return { rows, columns };
};

export const addRecipient = (newLocation, playerId) => {
  newLocation.type = "premium";
  newLocation.recipients = newLocation.recipients || [];
  newLocation.recipients.push(playerId);
};

export const getCoordinate = ({ x, y }) => ({ x, y });

export const generateRoute = (route, dx, dy, grid) => {
  const newRoute = structuredClone(route);
  newRoute.destination.x += dx;
  newRoute.destination.y += dy;

  newRoute.steps += 1;
  newRoute.isValid = true;

  const { rows, columns } = getBoundary(grid);

  if (!isInBoundary(newRoute.destination, rows, columns)) {
    newRoute.isValid = false;
    return newRoute;
  }

  newRoute.path.push(getCoordinate(route.destination));

  const playerId = getPlayerId(grid, newRoute.destination);
  if (playerId !== null) {
    addRecipient(newRoute, playerId);
  }

  return newRoute;
};

const hasVisited = (path, point) => {
  return path.some(({ x, y }) => x === point.x && y === point.y);
};

export const moveFourDirections = (queue, current, grid) => {
  const offsets = [
    { dx: 0, dy: 1 }, // top
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // down
    { dx: -1, dy: 0 }, // left
  ];

  for (const { dx, dy } of offsets) {
    const route = generateRoute(current, dx, dy, grid);
    if (route.isValid && !hasVisited(route.path, route.destination)) {
      delete route.isValid;
      queue.push(route);
    }
  }
};

export const findJumpableRoutes = (tileNumber, grid) => {
  const routes = [];
  grid.forEach((row, x) =>
    row.forEach((tile, y) => {
      if (tile.value === tileNumber && tile.playerId === null) {
        routes.push({ destination: { x, y }, type: "jump" });
      }
    })
  );
  return routes;
};

const findCheapestRoute = (routes) =>
  routes.reduce((previousRoute, currentRoute) => {
    if (currentRoute.type === "jump") {
      return currentRoute;
    }
    if (previousRoute.type === "normal" || previousRoute.type === "jump") {
      return previousRoute;
    }
    if (currentRoute.type === "normal") {
      return currentRoute;
    }
    return previousRoute.recipients.length < currentRoute.recipients.length
      ? previousRoute
      : currentRoute;
  });

export const extractDestinations = (locations) => {
  return Object.values(locations).map(findCheapestRoute);
};

export const addRoute = (routes, route) => {
  const key = `${route.destination.x},${route.destination.y}`;
  routes[key] = routes[key] || [];
  delete route.steps;
  routes[key].push(route);
};

export const addJumpRoutes = (locations, totalSteps, grid) => {
  const jumps = findJumpableRoutes(totalSteps, grid);

  jumps.forEach((coord) => {
    addRoute(locations, coord);
  });
};

export const findRoutes = (start, totalSteps, grid) => {
  const initialRoute = {
    destination: start,
    steps: 0,
    type: "normal",
    path: [],
  };
  const routes = [initialRoute];

  const finalizedRoutes = {};

  while (routes.length > 0) {
    const current = routes.shift();

    if (current.steps === totalSteps) {
      const playerId = getPlayerId(grid, current.destination);
      if (playerId === null) {
        addRoute(finalizedRoutes, current);
      }
      continue;
    }

    moveFourDirections(routes, current, grid);
  }

  addJumpRoutes(finalizedRoutes, totalSteps, grid);
  return extractDestinations(finalizedRoutes);
};
