import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { setupState } from "../../../src/utils/util.js";

const designCards = [
  {
    "id": 5,
    "victoryPoints": 1,
    "design": [
      { "coord": { "x": 2, "y": 0 }, "color": 5 },
      { "coord": { "x": 2, "y": 1 }, "color": 5 },
      { "coord": { "x": 2, "y": 2 }, "color": 5 },
      { "coord": { "x": 2, "y": 3 }, "color": 5 },
      { "coord": { "x": 2, "y": 4 }, "color": 5 },
    ],
  },
  {
    "id": 2,
    "victoryPoints": 1,
    "design": [
      { "coord": { "x": 1, "y": 0 }, "color": 5 },
      { "coord": { "x": 2, "y": 1 }, "color": 5 },
      { "coord": { "x": 3, "y": 2 }, "color": 5 },
      { "coord": { "x": 4, "y": 3 }, "color": 5 },
      { "coord": { "x": 3, "y": 1 }, "color": 1 },
      { "coord": { "x": 4, "y": 0 }, "color": 1 },
    ],
  },
];

describe("Design card handlers", () => {
  let currentPlayer, app, headers;

  beforeEach(async () => {
    const result = await setupState();

    app = result.app;
    currentPlayer = result.currentPlayer;
    headers = result.headers;
  });

  describe("GET /game/claim-design", () => {
    it.ignore(
      "should return details of design card if that design pattern has matched with the board",
      async () => {
        currentPlayer.addDesignCard(designCards[0]);

        const res = await app.request("/game/claim-design/5", { headers });
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, true);
      },
    );

    it.ignore(
      "should return details of design card if that design pattern is not present in the board",
      async () => {
        currentPlayer.addDesignCard(designCards[1]);

        const res = await app.request("/game/claim-design/2", { headers });
        const claimingStatus = await res.json();

        assertEquals(claimingStatus.success, true);
        assertEquals(claimingStatus.result.isMatched, false);
      },
    );
  });
});
