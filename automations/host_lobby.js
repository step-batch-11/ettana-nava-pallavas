import { goto, into, openBrowser, textBox, write, click } from "taiko";

const main = async () => {
  await openBrowser({ headless: false });
  await goto("localhost:8000");
  await write("player1", into(textBox("Username")));
  await click("Play")
  await click("Host")
  await write("First", into(textBox("Room Name")))
  await click("Submit");
};

main();
