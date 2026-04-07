export class Lobby {
  #id;
  #capacity;
  #room;

  constructor(id, capacity = 2) {
    this.#id = id;
    this.#capacity = capacity;
    this.#room = {
      id: 1,
      players: {},
    };
  }

  enterLobby(player) {
    if (Object.entries(this.#room.players).length > 2) {
      throw new Error("Room is full");
    }
    this.#room.players[player.id] = player;
  }

  exitLobby(playerId) {
    delete this.#room.players[playerId];
  }

  getLobbyState() {
    return {
      id: this.#id,
      capacity: this.#capacity,
      players: this.#room.players,
    };
  }
}
