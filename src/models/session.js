export default class Session {
  constructor() {
    this.session = {};
  }

  add(playerId, roomId) {
    const sessionId = Date.now();
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
