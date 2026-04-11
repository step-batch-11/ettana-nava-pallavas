import { beforeEach, describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { removeAcs, setupState } from "../../../src/utils/util.js";

const moveActionCard = {
  id: 1,
  "type": "move",
  "description": "Move to any unoccupied position",
};

describe("Move Action Card", () => {
  let opponent, currentPlayer, currentPlayerSId, players, app, headers;

  beforeEach(async () => {
    const result = await setupState();

    app = result.app;
    currentPlayer = result.currentPlayer;
    currentPlayerSId = result.currentPlayerSId;
    headers = result.headers;
    players = result.players;

    opponent = Object.values(players).find((x) =>
      x.getId() !== currentPlayerSId
    );
  });

  it("when move action card played, then should return all unoccupied positions on the board and remove the action card : ", async () => {
    currentPlayer.setup(1, { x: 0, y: 0 });
    opponent.setup(2, { x: 1, y: 1 });

    const expectedDestinations = [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [1, 0],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
      [2, 5],
      [3, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [3, 4],
      [3, 5],
      [4, 0],
      [4, 1],
      [4, 2],
      [4, 3],
      [4, 4],
      [4, 5],
      [5, 0],
      [5, 1],
      [5, 2],
      [5, 3],
      [5, 4],
      [5, 5],
    ];

    currentPlayer.addActionCard(moveActionCard);

    const response = await app.request("/game/action-card/1", {
      method: "PATCH",
      headers,
    });
    const { result, success } = await response.json();

    assertEquals(success, true);
    assertEquals(result.availableDestinations, expectedDestinations);
  });

  it("when played action card is invalid, then should throw error and no update in state: ", async () => {
    currentPlayer.addActionCard(moveActionCard);
    const response = await app.request("/game/action-card/0", {
      method: "PATCH",
      headers,
    });
    const { success, error } = await response.json();

    assertEquals(success, false);
    assertEquals(error.message, "Card is missing");
  });

  it("when player does not have move action card but wants to play, then should throw error and no update in state: ", async () => {
    removeAcs(currentPlayer);

    const response = await app.request("/game/action-card/1", {
      method: "PATCH",
      headers,
    });
    const { success, error } = await response.json();

    assertEquals(success, false);
    assertEquals(error.message, "Card is missing");
  });
});
