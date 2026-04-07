export class Room {
  #id;
  #capacity;
  #players;
  constructor(id, capacity = 2) {
    this.#id = id;
    this.#capacity = capacity;
    this.#players = {};
  }

  enterRoom(player) {
    if (Object.entries(this.#players).length > 2) {
      throw new Error("Room is full");
    }
    this.#players[player.id] = player;
  }

  exitRoom(playerId) {
    delete this.#players[playerId];
  }

  getRoomState() {
    return {
      id: this.#id,
      capacity: this.#capacity,
      players: this.#players,
    };
  }
}
