import { beforeEach, describe, it } from "@std/testing/bdd";
import Player from "../../src/models/player.js";
import { assertEquals } from "@std/assert";

describe("player", () => {
  let player;

  beforeEach(() => {
    player = new Player(1, "John");
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
      player.incrementVp();

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
      player.removeActionCard({ id: 1 });
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

      player.removeDesignCard({ id: 1 });
      assertEquals(player.getDc().length, 0);
    });
  });
});
