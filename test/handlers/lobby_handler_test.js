import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import Session from "../../src/models/session.js";
import { createApp } from "../../src/app.js";
import { toJSON } from "../../src/utils/util.js";

describe("lobby handler", () => {
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

  it("host lobby without passing any data", async () => {
    const result = await app.request("/lobby/host-game", {
      method: "POST",
    }).then(toJSON);

    assertEquals(result.success, false);
  });

  it("host lobby", async () => {
    const body = JSON.stringify({ username: "kha" });
    const result = await app.request("/lobby/host-game", {
      body,
      method: "POST",
    }).then(toJSON);

    assertEquals(result.state.start, false);
    assertEquals(result.state.players.length, 1);
  });

  it("join lobby without room id", async () => {
    const body = JSON.stringify({ username: "sim", roomId: "r" });
    const result = await app.request("/lobby/join", {
      body,
      method: "POST",
    }).then(toJSON);

    assertEquals(result.success, false);
    assertEquals(result.error, "No Lobby Found");
  });

  it("join lobby", async () => {
    const reqBody = JSON.stringify({ username: "kha" });
    const res1 = await app.request("/lobby/host-game", {
      body: reqBody,
      method: "POST",
    }).then(toJSON);

    const roomId = res1.roomId;

    const body = JSON.stringify({ username: "sim", roomId });
    const result = await app.request("/lobby/join", {
      body,
      method: "POST",
    }).then(toJSON);

    assertEquals(result.state.start, false);
    assertEquals(result.state.players.length, 2);
  });

  it("lobby state without sessionId", async () => {
    const result = await app.request("/lobby/get-state", {
      method: "GET",
    })
      .then(toJSON);

    assertEquals(result.success, false);
  });

  it("lobby state ", async () => {
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
    const result = await app.request("/lobby/get-state", {
      method: "GET",
      headers,
    })
      .then(toJSON);

    assertEquals(result.success, true);
    assertEquals(result.state.players.length, 2);
    assertEquals(result.state.start, false);
  });

  it.ignore("exit lobby without passing id", async () => {
    const res = await app.request(`/lobby/exit-lobby`, {
      body,
      method: "DELETE",
    }).then(toJSON);

    assertEquals(res.success, false);
  });

  it.ignore("exit lobby", async () => {
    const reqBody = JSON.stringify({ username: "kha" });
    const res1 = await app.request("/lobby/host-game", {
      body: reqBody,
      method: "POST",
    }).then(toJSON);

    const roomId = res1.roomId;

    const body = JSON.stringify({ username: "sim", roomId });
    const result = await app.request("/lobby/join", {
      body,
      method: "POST",
    }).then(toJSON);

    const playerId = result.state.players[0].id;

    const res = await app.request(`/lobby/exit-lobby/${playerId}`, {
      body,
      method: "DELETE",
    }).then(toJSON);

    assertEquals(res.success, true);
  });

  it("game start without sessionId", async () => {
    const result = await app.request("/lobby/start-game", {
      method: "GET",
    })
      .then(toJSON);

    assertEquals(result.success, false);
  });

  it("game start", async () => {
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
    const result = await app.request("/lobby/start-game", {
      method: "GET",
      headers,
    })
      .then(toJSON);

    assertEquals(result.message, "Game started");
  });
});
