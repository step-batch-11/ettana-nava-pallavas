import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert/equals";
import Player from "../../src/models/player.js";
import { assertThrows } from "@std/assert/throws";

describe("Player Class", () => {
  let player;
  beforeEach(() => {
    player = new Player(1, "hi");
  });

  describe("getId method:", () => {
    it("should give id successfully", () => {
      assertEquals(player.getId(), 1);
    });
  });
  describe("get action card method:", () => {
    it("should give card successfully", () => {
      player.addActionCard({
        "id": 6,
        "type": "tax",
        "description": "All other players pay 1 token to the reserve.",
      });
      assertEquals(player.getActionCard(6), {
        "id": 6,
        "type": "tax",
        "description": "All other players pay 1 token to the reserve.",
      });
    });
    it("should throw error for invalid id : ", () => {
      assertThrows(() => player.getActionCard(6));
    });
  });
});
