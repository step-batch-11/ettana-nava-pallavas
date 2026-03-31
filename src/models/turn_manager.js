export class TurnManager {
  #game;
  #randomFn;
  destinations;

  constructor(game, randomFn = Math.random) {
    this.#game = game;
    this.#randomFn = randomFn;
  }

  #randomInRange(min, max) {
    return Math.floor(this.#randomFn() * max) + min;
  }

  rollDice() {
    const colorId = this.#randomInRange(1, 6);
    const number = this.#randomInRange(1, 6);
    return { number, colorId };
  }

  #stripSteps(object) {
    const obj = structuredClone(object);
    delete obj.steps;
    return obj;
  }

  #movePoint(point, dx, dy) {
    const newPoint = structuredClone(point);
    newPoint.x += dx;
    newPoint.y += dy;
    newPoint.steps += 1;
    newPoint.isValid = true;
    if (!this.#inBoundary(newPoint)) {
      newPoint.isValid = false;
      return newPoint;
    }
    newPoint.path.push(this.#getCoordinate(point));
    const tile = this.#getTile(newPoint);
    if (tile.playerId !== null) {
      newPoint.type = "premium";
      newPoint.recipients = newPoint.recipients || [];
      newPoint.recipients.push(tile.playerId);
    }

    return newPoint;
  }

  #getTile(point) {
    return this.#game.board.tiles[point.x][point.y];
  }

  #getBoundary() {
    const rows = this.#game.board.tiles.length;
    const columns = this.#game.board.tiles[0].length;
    return { rows, columns };
  }

  #inBoundary({ x, y }) {
    const { rows, columns } = this.#getBoundary();
    return x > -1 && x < rows && y > -1 && y < columns;
  }

  #getCoordinate({ x, y }) {
    return { x, y };
  }

  #hasVisited(path, point) {
    return path.some(({ x, y }) => x === point.x && y === point.y);
  }

  #findJumpableLocations(tileNumber) {
    const coords = [];
    this.#game.board.tiles.forEach((row, x) =>
      row.forEach((tile, y) => {
        if (tile.value === tileNumber && tile.playerId === null) {
          coords.push({ x, y, type: "jump" });
        }
      }),
    );
    return coords;
  }

  #addCoordinate(locations, coordinate) {
    const key = `${coordinate.x},${coordinate.y}`;
    locations[key] = locations[key] || [];
    locations[key].push(this.#stripSteps(coordinate));
  }

  #addToQueue(queue, point) {
    if (point.isValid && !this.#hasVisited(point.path, point)) {
      delete point.isValid;
      queue.push(point);
    }
  }

  #addLocation(locations, current) {
    const tile = this.#getTile(current);
    if (tile.playerId === null) {
      this.#addCoordinate(locations, current);
    }
  }

  #getDirectionOffsets() {
    return [
      { dx: 0, dy: 1 }, // top
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: -1 }, // down
      { dx: -1, dy: 0 }, // left
    ];
  }

  #moveFourDirections(queue, current) {
    const offsets = this.#getDirectionOffsets();

    for (const { dx, dy } of offsets) {
      const newPoint = this.#movePoint(current, dx, dy);
      this.#addToQueue(queue, newPoint);
    }
  }

  #addJumpCoordinates(locations, totalSteps) {
    const jumps = this.#findJumpableLocations(totalSteps);

    jumps.forEach((coord) => {
      this.#addCoordinate(locations, coord);
    });
  }

  #extractDestinations(locations) {
    return Object.values(locations).map((routes) =>
      routes.reduce((a, b) => {
        if (b.type === "jump") {
          return b;
        }
        if (a.type === "normal" || a.type === "jump") {
          return a;
        }
        if (b.type === "normal") {
          return b;
        }
        return a.recipients.length < b.recipients.length ? a : b;
      }),
    );
  }

  findRoutes(start, totalSteps) {
    const queue = [start];

    const locations = {};

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.steps === totalSteps) {
        this.#addLocation(locations, current);
        continue;
      }

      this.#moveFourDirections(queue, current);
    }
    this.#addJumpCoordinates(locations, totalSteps);

    return this.#extractDestinations(locations);
  }

  findPossibleDestinations(totalSteps) {
    const start = this.#game.currentPlayer.pin.position;
    const locations = this.findRoutes(
      { ...start, steps: 0, type: "normal", path: [] },
      totalSteps,
    );
    this.destinations = locations;
    return this.destinations;
  }

  #processTilePenalty(tile, payer) {
    const payee = this.#game.players.find(
      (player) => player.id === tile.playerId,
    );

    payer.tokens -= 1;
    payee.tokens += 1;

    return payee.id;
  }

  #traversePathTile(currentPlayer, path) {
    const payees = [];

    for (const step of path) {
      const tile = this.#game.board.tiles[step.x][step.y];

      if (tile.playerId !== null && tile.playerId !== currentPlayer.id) {
        const payee = this.#processTilePenalty(tile, currentPlayer);

        payees.push(payee);
      }
    }
    return { payerTokens: currentPlayer.tokens, payees };
  }

  #isValidDestination({ x, y }) {
    return this.destinations.some(
      (destination) => destination.x === x && destination.y === y,
    );
  }

  #displacePin(currentPlayer, destination, currentPosition) {
    const destinationTile = this.#getTile(destination);
    const prePositionTile = this.#getTile(currentPosition);

    destinationTile.playerId = currentPlayer.id;
    prePositionTile.playerId = null;
  }

  move(path, destination) {
    const currentPlayer = this.#game.currentPlayer;
    const currentPosition = currentPlayer.pin.position;

    if (this.#isValidDestination(destination)) {
      this.#traversePathTile(currentPlayer, path);
      this.#displacePin(currentPlayer, destination, currentPosition);

      return destination;
    }

    return currentPosition;
  }
}
