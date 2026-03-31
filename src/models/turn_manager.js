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

  #rollColorDice() {
    return this.#randomInRange(1, 6);
  }

  #rollNumberDice() {
    return this.#randomInRange(1, 6);
  }

  rollDice() {
    const colorId = this.#rollColorDice();
    const number = this.#rollNumberDice();
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

  #getPlayerById(id) {
    return this.#game.players.find((player) => player.id === id);
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
      })
    );
    return coords;
  }

  findPossibleDestinations(totalSteps) {
    const offsets = [
      { dx: 0, dy: 1 }, // top
      { dx: 1, dy: 0 }, // right
      { dx: 0, dy: -1 }, // down
      { dx: -1, dy: 0 }, // left
    ];
    const start = this.#game.currentPlayer.pin.position;
    const queue = [{ ...start, steps: 0, type: "normal", path: [] }];

    const locations = {};

    while (queue.length > 0) {
      const current = queue.shift();

      if (current.steps === totalSteps) {
        const tile = this.#getTile(current);
        if (tile.playerId === null) {
          const key = `${current.x},${current.y}`;
          locations[key] = this.#stripSteps(current);
        }
        continue;
      }

      for (const { dx, dy } of offsets) {
        const newPoint = this.#movePoint(current, dx, dy);
        if (newPoint.isValid && !this.#hasVisited(newPoint.path, newPoint)) {
          delete newPoint.isValid;
          queue.push(newPoint);
        }
      }
    }

    const jumps = this.#findJumpableLocations(totalSteps);

    jumps.forEach((coord) => {
      const key = `${coord.x},${coord.y}`;
      locations[key] = coord;
    });
    this.destinations = Object.values(locations);
    return this.destinations;
  }

  #processPathPenalty(payer, payees) {
    payees.forEach((payeeId) => {
      const payee = this.#getPlayerById(payeeId);
      payee.tokens++;
      payer.tokens--;
    });
  }

  #isValidDestination({ x, y }) {
    return this.destinations.some((destination) =>
      destination.x === x && destination.y === y
    );
  }

  #displacePin(currentPlayer, destination, currentPosition) {
    const destinationTile = this.#getTile(destination);
    const prePositionTile = this.#getTile(currentPosition);

    destinationTile.playerId = currentPlayer.id;
    prePositionTile.playerId = null;
  }

  move(destination) {
    const currentPlayerId = this.#game.currentPlayer.playerId;
    const currentPlayer = this.#getPlayerById(currentPlayerId);
    const currentPosition = currentPlayer.pin.pos;
    const destinationCoords = this.#getCoordinate(destination);

    if (this.#isValidDestination(destination)) {
      if (destination.type === "premium") {
        this.#processPathPenalty(currentPlayer, destination.recipients);
      }
      currentPlayer.pin.pos = destinationCoords;
      this.#game.currentPlayer.pin.position = destinationCoords;
      this.#displacePin(currentPlayer, destination, currentPosition);

      return { source: currentPosition, destination: destinationCoords };
    }
    return { source: currentPosition, destination: currentPosition };
  }

  #isValidYarn({ x, y }, yarns) {
    const rows = yarns.length;
    const columns = yarns[0].length;

    return x >= 0 && x < rows && y >= 0 && y < columns;
  }

  getAdjYarnsPositions(pinPosition) {
    const yarns = [
      { x: pinPosition.x - 1, y: pinPosition.y - 1 },
      { x: pinPosition.x - 1, y: pinPosition.y },
      { x: pinPosition.x, y: pinPosition.y - 1 },
      { x: pinPosition.x, y: pinPosition.y },
    ];

    return yarns.filter((yarn) =>
      this.#isValidYarn(yarn, this.#game.board.yarns)
    );
  }
}
