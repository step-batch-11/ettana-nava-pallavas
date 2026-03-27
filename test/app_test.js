import { assertEquals } from "@std/assert";
import { app } from "../src/app.js";

Deno.test("just a dummy test", () => {
  assertEquals(app(), 1);
});
