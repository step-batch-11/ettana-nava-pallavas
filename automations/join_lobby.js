import { $, click, goto, into, openBrowser, textBox, write } from "taiko";

export const main = async () => {
  await openBrowser({ headless: false, args: ["--start-fullscreen"] });
  await goto("localhost:8000");
  await write("player2", into(textBox("Username")));
  await click("Play");
  await click("Join Lobby");
  await write("1", into($(".octa:nth-child(1)")));
  await write("0", into($(".octa:nth-child(2)")));
  await write("0", into($(".octa:nth-child(3)")));
  await write("0", into($(".octa:nth-child(4)")));
  await click("Join");
  await click("Start game");
};

main();
