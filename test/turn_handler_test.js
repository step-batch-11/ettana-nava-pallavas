import { describe, it, beforeEach } from "@std/testing/bdd";
import { assert, assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";
import { logger } from "hono/logger";

describe("roll dice request : ", () => {
  let app;

  let randomValue = 0.05;

  beforeEach(() => {
    app = createApp({}, () => randomValue, logger);
  });

  it("When /roll is hit, should respond with dice values and destinations", async () => {
    const response = await app.request("/game/roll", { method: "POST" });
    const data = await response.json();

    assertEquals(response.status, 200);
    assert("destinations" in data);
    assert("diceValues" in data);
    assertEquals(data.diceValues.number, 1);
    assertEquals(data.diceValues.colorId, 1);
    assertEquals(data.destinations, [
      { x: 1, y: 2, type: "normal", path: [{ x: 1, y: 1 }] },
      { x: 2, y: 1, type: "normal", path: [{ x: 1, y: 1 }] },
      { x: 1, y: 0, type: "normal", path: [{ x: 1, y: 1 }] },
      { x: 0, y: 1, type: "jump" },
      { x: 1, y: 3, type: "jump" },
      { x: 3, y: 1, type: "jump" },
      { x: 4, y: 3, type: "jump" },
    ]);
  });

  it("When /roll is hit, should respond with dice values and destinations", async () => {
    randomValue = 0.5;
    const response = await app.request("/game/roll", { method: "POST" });
    const data = await response.json();

    assertEquals(response.status, 200);
    assert("destinations" in data);
    assert("diceValues" in data);
    assertEquals(data.diceValues.number, 4);
    assertEquals(data.diceValues.colorId, 4);
    assertEquals(data.destinations, [
      {
        x: 1,
        y: 5,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 1, y: 2 },
          { x: 1, y: 3 },
          { x: 1, y: 4 },
        ],
      },
      {
        x: 2,
        y: 4,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 2 },
          { x: 2, y: 3 },
        ],
      },
      { x: 0, y: 4, type: "jump" },
      { x: 2, y: 2, type: "jump" },
      {
        x: 0,
        y: 2,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 1, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 1 },
        ],
      },
      {
        x: 1,
        y: 3,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 2 },
        ],
      },
      {
        x: 4,
        y: 2,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 4, y: 1 },
        ],
      },
      {
        x: 3,
        y: 1,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
      },
      {
        x: 2,
        y: 0,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 0, y: 1 },
          { x: 0, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      {
        x: 0,
        y: 0,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 2, y: 0 },
          { x: 1, y: 0 },
        ],
      },
      {
        x: 5,
        y: 1,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 4, y: 1 },
        ],
      },
      {
        x: 4,
        y: 0,
        type: "normal",
        path: [
          { x: 1, y: 1 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
        ],
      },
      { x: 3, y: 4, type: "jump" },
      { x: 5, y: 2, type: "jump" },
    ]);
  });
});
