import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";
import Session from "../src/models/session.js";
import { toJSON } from "../src/utils/util.js";


describe("App test", () => {
  let rooms, players, sessions, app;
  beforeEach(() => {
    rooms = {};
    players = {};
    sessions = new Session();

    app = createApp(
      rooms,
      players,
      sessions,
    );
  });

  it("when player is not authenticated", async () => {
    const result = await app.request("/game/hi").then(toJSON);

    assertEquals(result.error, "You do not have permission to play");
    assertEquals(result.success, false);
  });

  it("When player exists", async () => {
    const req1 = JSON.stringify({ username: "kha" });
    const res = await app.request("/lobby/host-game", {
      body: req1,
      method: "POST",
    }).then(toJSON);

    const roomId = res.roomId;
    const req2 = JSON.stringify({ username: "sim", roomId });

    const res2 = await app.request("/lobby/join", {
      body: req2,
      method: "POST",
    }).then(toJSON);

    const sessionId = res2.sessionId;
    const headers = new Headers();

    headers.append("Cookie", `sessionId=${sessionId}`);
    const gameRes = await app.request("/lobby/start-game", {
      method: "GET",
      headers,
    })
      .then(toJSON);

    assertEquals(gameRes.message, "Game started");

    const result = await app.request("/game/game-state", {
      method: "GET",
      headers,
    })
      .then(toJSON);

    assertEquals(result.state.players.length, 2);
  });
});
