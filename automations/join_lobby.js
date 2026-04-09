import { click, goto, into, openBrowser, textBox, write } from "taiko";

export const main = async () => {
  await openBrowser({ headless: false, args: ["--start-fullscreen"] });
  await goto("localhost:8000");
  await write("player2", into(textBox("Username")));
  await click("Play");
  await click("Join");
  await write("1000", into(textBox("Room ID")));
  await click("Submit");
  await click("Start game");
};

main();
