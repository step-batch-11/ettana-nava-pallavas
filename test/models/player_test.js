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

  describe("tokens", () => {
    it("debit tokens", () => {
      player.creditTokens(2);
      assertEquals(player.getTokens(), 2);

      player.debitTokens(3);
      assertEquals(player.getTokens(), 2);
    });
  });

  describe("vp", () => {
    it("start of game", () => {
      assertEquals(player.getVp(), 0);
    });

    it("increment vp by 1", () => {
      player.updateVp(1);

      assertEquals(player.getVp(), 1);
    });
  });

  describe("adding action cards", () => {
    it("start of game", () => {
      assertEquals(player.getAc(), []);
    });

    it("add action card", () => {
      player.addActionCard({ id: 1, type: "something" });

      assertEquals(player.getAc(), [{ id: 1, type: "something" }]);
    });

    it("add more action cards", () => {
      player.addActionCard({ id: 1, type: "something" });
      player.addActionCard({ id: 2, type: "something 2" });

      assertEquals(player.getAc(), [{ id: 1, type: "something" }, {
        id: 2,
        type: "something 2",
      }]);
    });
  });

  describe("adding design cards", () => {
    it("start of game", () => {
      assertEquals(player.getDc(), []);
    });

    it("add action card", () => {
      player.addDesignCard({ id: 1, type: "something" });

      assertEquals(player.getDc(), [{ id: 1, type: "something" }]);
    });

    it("add more action cards", () => {
      player.addDesignCard({ id: 1, type: "something" });
      player.addDesignCard({ id: 2, type: "something 2" });

      assertEquals(player.getDc(), [{ id: 1, type: "something" }, {
        id: 2,
        type: "something 2",
      }]);
    });
  });

  describe("removing action cards", () => {
    it("removing when nothing is there", () => {
      player.removeActionCard();

      assertEquals(player.getDc().length, 0);
    });

    it("removing when some data is there", () => {
      player.addActionCard({ id: 1 });

      assertEquals(player.getAc().length, 1);
      player.removeActionCard(1);
      assertEquals(player.getAc().length, 0);
    });
  });

  describe("removing design cards", () => {
    it("removing when nothing is there", () => {
      player.removeDesignCard();

      assertEquals(player.getDc().length, 0);
    });

    it("removing when some data is there", () => {
      player.addDesignCard({ id: 1 });

      assertEquals(player.getDc().length, 1);

      player.removeDesignCard(1);
      assertEquals(player.getDc().length, 0);
    });
  });

  describe("take token", () => {
    it("Successfully takes only one token", () => {
      player.creditTokens(1);
      assertEquals(player.takeToken(), 1);
    });

    it("Successfully takes two tokens if the player has more than two tokens", () => {
      player.creditTokens(2);
      assertEquals(player.takeToken(), 2);
    });

    it("throws an error if player doesn't have any tokens", () => {
      assertThrows(() => player.takeToken());
    });
  });
});
