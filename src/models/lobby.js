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
    const players = Object.entries(this.#room.players);
    if (players.length > 2) {
      throw new Error("Room is full");
    }

    const playerInfo = player.getPlayerData();
    if (players.length === 0) {
      this.#room.HostId = playerInfo.playerId;
    }

    this.#room.players[playerInfo.playerId] = player;
    return { id: playerInfo.playerId };
  }

  exitLobby(playerId) {
    console.log(playerId);

    delete this.#room.players[playerId];
  }

  getLobbyState() {
    return {
      id: this.#id,
      capacity: this.#capacity,
      players: Object.values(this.#room.players)
        .map((player) => {
          const { playerId, name } = player.getPlayerData();
          return {
            id: playerId,
            name,
          };
        }),
    };
  }
}
