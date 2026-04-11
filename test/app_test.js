import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals, assertFalse } from "@std/assert";
import { createApp } from "../src/app.js";
import Session from "../src/models/session.js";
import { toJSON } from "../src/utils/util.js";

describe("App test", () => {
  let rooms, players, sessions, app, roomIds;
  beforeEach(() => {
    rooms = {};
    players = {};
    sessions = new Session();
    roomIds = { value: 999 };
    app = createApp(
      rooms,
      players,
      sessions,
      roomIds,
    );
  });

  it("when player is not authenticated", async () => {
    const result = await app.request("/game/hi").then(toJSON);

    assertEquals(result.error.message, "You do not have permission to play");
    assertEquals(result.success, false);
  });

  it("When player other than host tries to start the game, it shouldn't start:", async () => {
    const req1 = JSON.stringify({ username: "kha" });
    const res = await app
      .request("/lobby/host-game", {
        body: req1,
        method: "POST",
      })
      .then(toJSON);

    const roomId = res.roomId;
    const req2 = JSON.stringify({ username: "sim", roomId });

    const res2 = await app
      .request("/lobby/join", {
        body: req2,
        method: "POST",
      })
      .then(toJSON);

    const sessionId = res2.sessionId;
    const headers = new Headers();

    headers.append("Cookie", `sessionId=${sessionId}`);
    const gameRes = await app
      .request("/lobby/start-game", {
        method: "GET",
        headers,
      })
      .then(toJSON);

    assertEquals(gameRes.error.message, "Only host can start the game.");
    assertFalse(gameRes.status);
  });
  it("When host tries to start the game:", async () => {
    const req1 = JSON.stringify({ username: "kha" });
    const res = await app
      .request("/lobby/host-game", {
        body: req1,
        method: "POST",
      })
      .then(toJSON);

    const roomId = res.roomId;
    const req2 = JSON.stringify({ username: "sim", roomId });

    await app
      .request("/lobby/join", {
        body: req2,
        method: "POST",
      })
      .then(toJSON);

    const sessionId = res.sessionId;
    const headers = new Headers();

    headers.append("Cookie", `sessionId=${sessionId}`);
    const gameRes = await app
      .request("/lobby/start-game", {
        method: "GET",
        headers,
      })
      .then(toJSON);

    const result = await app.request("/game/game-state", {
      method: "GET",
      headers,
    });
    const gameState = await result.json();
    assertEquals(gameRes.message, "Game started");
    assertEquals(gameState.state.players.length, 2);
  });
  it("When there is only single player and host tries to start the game, it shouldn't start the game:", async () => {
    const req1 = JSON.stringify({ username: "kha" });
    const res = await app
      .request("/lobby/host-game", {
        body: req1,
        method: "POST",
      })
      .then(toJSON);

    const sessionId = res.sessionId;
    const headers = new Headers();

    headers.append("Cookie", `sessionId=${sessionId}`);
    const gameRes = await app
      .request("/lobby/start-game", {
        method: "GET",
        headers,
      })
      .then(toJSON);

    assertEquals(gameRes.error.message, "Not enough player to start the game");
    assertFalse(gameRes.status);
  });
});
