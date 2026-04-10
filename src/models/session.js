export default class Session {
  constructor() {
    this.session = {};
  }

  add(playerId, roomId) {
    const sessionId = playerId;
    this.session[sessionId] = {
      playerId,
      roomId,
    };

    return sessionId;
  }

  get(id) {
    return this.session[id];
  }
}
