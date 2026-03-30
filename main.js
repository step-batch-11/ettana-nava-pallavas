import { createApp } from "./src/app.js";

const boardState = {
  yarns: [
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
    [5, 4, 3, 2, 1],
    [1, 2, 3, 4, 5],
  ],
  tiles: [
    [
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
    ],
    [
      { value: null, pinId: null },
      { value: 1, pinId: null },
      { value: 2, pinId: null },
      { value: 3, pinId: null },
      { value: 4, pinId: null },
      { value: null, pinId: null },
    ],
    [
      { value: null, pinId: null },
      { value: 5, pinId: null },
      { value: 6, pinId: null },
      { value: 1, pinId: null },
      { value: 2, pinId: null },
      { value: null, pinId: null },
    ],
    [
      { value: null, pinId: null },
      { value: 3, pinId: null },
      { value: 4, pinId: null },
      { value: 5, pinId: null },
      { value: 6, pinId: null },
      { value: null, pinId: null },
    ],
    [
      { value: null, pinId: null },
      { value: 2, pinId: null },
      { value: 3, pinId: null },
      { value: 4, pinId: null },
      { value: 5, pinId: null },
      { value: null, pinId: null },
    ],
    [
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
      { value: null, pinId: null },
    ],
  ],
};

const main = () => {
  const PORT = Deno.env.get("PORT") || 8000;

  const app = createApp(boardState);

  Deno.serve({ port: PORT }, app.fetch);
};

main();
