import { click, goto, into, openBrowser, textBox, write } from "taiko";

export const main = async () => {
  await openBrowser({ headless: false, args: ["--start-fullscreen"] });
  await goto("localhost:8000");
  await write("player1", into(textBox("Username")));
  await click("Play");
  await click("Host");
  await write("First", into(textBox("ROOM")));
  await click("Create");
};

main();
