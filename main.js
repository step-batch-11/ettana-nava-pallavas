import { createApp } from "./src/app.js";
import designCards from "./src/config/design_card.json" with { type: "json" };
import actionCards from "./src/config/action_card.json" with { type: "json" };
import Bank from "./src/models/bank.js";
import { _gameState } from "./src/data/state.js";

const main = () => {
  const bank = new Bank(designCards, actionCards);
  const PORT = Deno.env.get("PORT") || 8000;
  const app = createApp(_gameState, bank);

  Deno.serve({ port: PORT }, app.fetch);
};

main();
