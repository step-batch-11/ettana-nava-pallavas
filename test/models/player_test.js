import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import Player from "../../src/models/player.js";

describe("Player", () => {
  let player1;
  beforeEach(() => {
    player1 = new Player(2, "jeni");
  });

  describe("getId", () => {
    it("should return id of the player instance", () => {
      const id = player1.getId();
      assertEquals(id, 2);
    });
  });
});
