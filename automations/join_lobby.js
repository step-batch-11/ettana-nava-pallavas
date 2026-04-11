import { $, click, goto, into, openBrowser, textBox, write } from "taiko";

export const main = async () => {
  await openBrowser({ headless: false, args: ["--start-fullscreen"] });
  await goto("localhost:8000");
  await write("Joiner", into(textBox("Username")));
  await click("Play");
  await click("Join Lobby");
  await write("1000", into($(".octa:nth-child(1) input")));
  await click("Join");
  // await click("Start game");
};

main();
