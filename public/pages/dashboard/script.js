const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const inputField = document.getElementById("inputField");

const joinBtn = document.getElementById("joinBtn");
const hostBtn = document.getElementById("hostBtn");
const cancelBtn = document.getElementById("cancelBtn");
const submitBtn = document.getElementById("submitBtn");

let currentAction = "";

joinBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modalTitle.textContent = "Enter Room ID";
  inputField.placeholder = "Room ID...";
  currentAction = "join";
});

hostBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modalTitle.textContent = "Enter Room Name";
  inputField.placeholder = "Room Name...";
  currentAction = "host";
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  inputField.value = "";
});

const handleHostGame = async (value) => {
  const username = localStorage.getItem("username");
  const res = await fetch("/lobby/host-game", {
    method: "POST",
    body: JSON.stringify({ name: value, username }),
  });

  const resBody = await res.json();
  if (resBody.success) {
    globalThis.location.assign("/lobby");
  }
};

const handleJoinGame = async (value) => {
  const username = localStorage.getItem("username");
  const res = await fetch("/lobby/join", {
    method: "POST",
    body: JSON.stringify({ roomId: value, username }),
  });

  const resBody = await res.json();
  if (resBody.success) {
    globalThis.location.assign("/lobby");
  }
};

submitBtn.addEventListener("click", () => {
  const value = inputField.value.trim();

  if (!value) {
    alert("Please enter value");
    return;
  }

  if (currentAction === "join") {
    handleJoinGame(value);
  } else {
    handleHostGame(value);
  }

  modal.classList.add("hidden");
  inputField.value = "";
});
