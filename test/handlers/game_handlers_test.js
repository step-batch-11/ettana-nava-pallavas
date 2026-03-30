import { beforeEach, describe, it } from "@std/testing/bdd";
import { createApp } from "../../src/app.js";
import { assertEquals } from "@std/assert/equals";
import { serveBoardState } from "../../src/handlers/game_handlers.js";

describe("Game route", () => {
  const obj = {};
  let app;

  beforeEach(() => {
    app = createApp(obj, obj);
  });

  it("GET /game/board-state should return the initial state as it is", async () => {
    const res = await app.request("/game/board-state");
    const boardState = await res.json();

    assertEquals(boardState.success, true);
    assertEquals(boardState.state, obj);
  });

  it("should fail if the context is wrong", () => {
    const mockCtx = {
      get: () => {
        throw new Error("forced failure");
      },
      json: (data) => data,
    };

    const result = serveBoardState(mockCtx);

    assertEquals(result.success, false);
    assertEquals(result.error, "forced failure");
  });
});
