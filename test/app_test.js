import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import { createApp } from "../src/app.js";

describe("Dummy test", () => {
  it("Server static page", async () => {
    const app = createApp();
    const res = await app.request("/");
    await res.text();

    assertEquals(res.status, 200);
  });
});
