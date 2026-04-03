const isOccupied = (players, { x, y }) =>
  players.some(({ position }) => position.x === x && position.y === y);

export const isInBoundary = ({ x, y }, rows, columns) => {
  return x > -1 && x < rows && y > -1 && y < columns;
};

export const getBoundary = (grid) => {
  const rows = grid.length;
  const columns = grid[0].length;

  return { rows, columns };
};

export const addRecipient = (newLocation, { playerId }) => {
  newLocation.type = "premium";
  newLocation.recipients = newLocation.recipients || [];
  newLocation.recipients.push(playerId);
};

export const getCoordinate = ({ x, y }) => ({ x, y });

export const generateRoute = (route, dx, dy, grid, players) => {
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

  if (isOccupied(players, newRoute.destination)) {
    const destination = newRoute.destination;
    const player = players.find(({ position: { x, y } }) =>
      destination.x === x && destination.y === y
    );

    addRecipient(newRoute, player);
  }

  return newRoute;
};

const hasVisited = (path, point) => {
  return path.some(({ x, y }) => x === point.x && y === point.y);
};

export const moveFourDirections = (queue, current, grid, players) => {
  const offsets = [
    { dx: 0, dy: 1 }, // top
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: -1 }, // down
    { dx: -1, dy: 0 }, // left
  ];

  for (const { dx, dy } of offsets) {
    const route = generateRoute(current, dx, dy, grid, players);
    if (route.isValid && !hasVisited(route.path, route.destination)) {
      delete route.isValid;
      queue.push(route);
    }
  }
};

export const findJumpableRoutes = (tileNumber, grid, players) => {
  const routes = [];
  grid.forEach((row, x) =>
    row.forEach((tile, y) => {
      if (tile === tileNumber && !isOccupied(players, { x, y })) {
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

export const addJumpRoutes = (locations, totalSteps, grid, players) => {
  const jumps = findJumpableRoutes(totalSteps, grid, players);

  jumps.forEach((coord) => {
    addRoute(locations, coord);
  });
};

export const findRoutes = (start, totalSteps, grid, players) => {
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
      if (!isOccupied(players, current.destination)) {
        addRoute(finalizedRoutes, current);
      }
      continue;
    }

    moveFourDirections(routes, current, grid, players);
  }

  addJumpRoutes(finalizedRoutes, totalSteps, grid, players);
  return extractDestinations(finalizedRoutes);
};
