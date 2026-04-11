import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import Session from "../../src/models/session.js";
import { createApp } from "../../src/app.js";
import { sendRequest, toJSON } from "../../src/utils/util.js";
import { assert } from "@std/assert/assert";

describe("lobby handler", () => {
  let rooms, players, sessions, app, roomIds;
  beforeEach(() => {
    rooms = {};
    players = {};
    sessions = new Session();
    roomIds = { value: 999 };

    app = createApp(rooms, players, sessions, roomIds);
  });

  it("host lobby without passing any data", async () => {
    const result = await app
      .request("/lobby/host-game", {
        method: "POST",
      })
      .then(toJSON);

    assertEquals(result.success, false);
  });

  it("host lobby", async () => {
    const body = JSON.stringify({ username: "kha" });
    const result = await app
      .request("/lobby/host-game", {
        body,
        method: "POST",
      })
      .then(toJSON);

    assertEquals(result.state.start, false);
    assertEquals(result.state.players.length, 1);
  });

  it("join lobby without room id", async () => {
    const body = JSON.stringify({ username: "sim", roomId: "r" });
    const result = await app
      .request("/lobby/join", {
        body,
        method: "POST",
      })
      .then(toJSON);

    assertEquals(result.success, false);
    assertEquals(result.error, "No Lobby Found");
  });

  it("join lobby when room is full", async () => {
    const reqBody = JSON.stringify({ username: "kha" });
    const player1 = await sendRequest(app, "/lobby/host-game", {
      body: reqBody,
    });

    const roomId = player1.roomId;

    const body = JSON.stringify({ username: "sim", roomId });
    await sendRequest(app, "/lobby/join", { body });

    const req = JSON.stringify({ username: "sheik", roomId });
    const { error, success } = await sendRequest(app, "/lobby/join", {
      body: req,
    });

    assertEquals(success, false);
    assertEquals(error, "Room is full");
  });

  it("join lobby", async () => {
    const reqBody = JSON.stringify({ username: "kha" });
    const res1 = await app
      .request("/lobby/host-game", {
        body: reqBody,
        method: "POST",
      })
      .then(toJSON);

    const roomId = res1.roomId;

    const body = JSON.stringify({ username: "sim", roomId });
    const result = await app
      .request("/lobby/join", {
        body,
        method: "POST",
      })
      .then(toJSON);

    assertEquals(result.state.start, false);
    assertEquals(result.state.players.length, 2);
  });

  it("lobby state without sessionId", async () => {
    const result = await app
      .request("/lobby/get-state", {
        method: "GET",
      })
      .then(toJSON);

    assertEquals(result.success, false);
  });

  it("lobby state ", async () => {
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
    const result = await app
      .request("/lobby/get-state", {
        method: "GET",
        headers,
      })
      .then(toJSON);

    assertEquals(result.success, true);
    assertEquals(result.state.players.length, 2);
    assertEquals(result.state.start, false);
  });

  it("exit lobby without passing id", async () => {
    const reqBody = JSON.stringify({ username: "kha" });
    const player1 = await sendRequest(app, "/lobby/host-game", {
      body: reqBody,
    });
    const headers = new Headers();
    headers.append("Cookie", `sessionId=${player1.sessionId}`);
    const res = await app
      .request(`/lobby/exit-lobby/${player1.sessionId}`, {
        body: JSON.stringify({}),
        headers,
        method: "DELETE",
      })
      .then(toJSON);

    assert(res.success);
  });

  it("exit lobby", async () => {
    const reqBody = JSON.stringify({ username: "kha" });
    const res1 = await app
      .request("/lobby/host-game", {
        body: reqBody,
        method: "POST",
      })
      .then(toJSON);

    const roomId = res1.roomId;

    const body = JSON.stringify({ username: "sim", roomId });
    const result = await app
      .request("/lobby/join", {
        body,
        method: "POST",
      })
      .then(toJSON);

    const playerId = result.state.players[0].id;

    const headers = new Headers();
    headers.append("Cookie", `sessionId=${playerId}`);

    const res = await app
      .request(`/lobby/exit-lobby/${playerId}`, {
        body,
        headers,
        method: "DELETE",
      })
      .then(toJSON);

    assertEquals(res.success, true);
  });

  it("game start without sessionId", async () => {
    const result = await app
      .request("/lobby/start-game", {
        method: "GET",
      })
      .then(toJSON);

    assertEquals(result.success, false);
  });

  it("game start without enough players", async () => {
    const req1 = JSON.stringify({ username: "kha" });
    const { sessionId } = await app
      .request("/lobby/host-game", {
        body: req1,
        method: "POST",
      })
      .then(toJSON);

    const headers = new Headers();

    headers.append("Cookie", `sessionId=${sessionId}`);
    const { error, success } = await app
      .request("/lobby/start-game", {
        method: "GET",
        headers,
      })
      .then(toJSON);

    assertEquals(success, false);
    assertEquals(error.message, "Not enough player to start the game");
  });

  it("game start", async () => {
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
    const result = await app
      .request("/lobby/start-game", {
        method: "GET",
        headers,
      })
      .then(toJSON);

    assertEquals(result.message, "Game started");
  });
});
