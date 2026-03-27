globalThis.startGame = () => {
  name = document.getElementById("playerName").value.trim();

  if (!name) {
    alert("Please enter your name!");
    return;
  }

  alert("Welcome to Ettana, " + name + "!");
};
