import { assertEquals } from "@std/assert";
import { beforeEach, describe, it } from "@std/testing/bdd";
import { pickRandom, shuffle } from "../src/utils.js";

describe("Shuffle", () => {
  let cards;

  beforeEach(() => {
    cards = [
      { "id": 1, "victoryPoints": 1 },
      { "id": 2, "victoryPoints": 3 },
      { "id": 3, "victoryPoints": 2 },
    ];
  });

  it(
    "should shuffle according to the randomFn given",
    () => {
      const randomFn = () => 1;

      const shuffled = shuffle(cards, randomFn);
      assertEquals(shuffled, [
        { "id": 2, "victoryPoints": 3 },
        { "id": 3, "victoryPoints": 2 },
        { "id": 1, "victoryPoints": 1 },
      ]);
    },
  );

  it(
    "randomFn gave something",
    () => {
      const randomFn = () => 1;

      const random = pickRandom(cards, randomFn);
      assertEquals(random, 3);
    },
  );
});
