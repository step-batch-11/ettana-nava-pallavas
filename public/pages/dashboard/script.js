import { showToast } from "/pages/utils/utils.js";

const joinPopup = document.getElementById("joinPopup");
const createPopup = document.getElementById("createPopup");

const joinBtn = document.getElementById("joinBtn");
const createBtn = document.getElementById("createBtn");

const closeJoinBtn = document.getElementById("closeJoin");
const closeCreateBtn = document.getElementById("closeCreate");

const joinActionBtn = document.getElementById("joinAction");
const createActionBtn = document.getElementById("createAction");

const inputs = document.querySelectorAll("#joinInputs .octa");
const roomNameInput = document.getElementById("roomName");

const attachListeners = () => {
  joinBtn.addEventListener("click", () => {
    joinPopup.classList.remove("hidden");
  });

  createBtn.addEventListener("click", () => {
    createPopup.classList.remove("hidden");
  });

  closeJoinBtn.addEventListener("click", () => {
    joinPopup.classList.add("hidden");
  });

  closeCreateBtn.addEventListener("click", () => {
    createPopup.classList.add("hidden");
  });
};

const attachInputListener = () => {
  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^0-9]/g, "");

      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
};

const handleJoin = async () => {
  const code = Array.from(inputs).map((i) => i.value).join("");

  if (code.length < 4) {
    alert("Enter full code");
    return;
  }

  const username = localStorage.getItem("username");

  try {
    const res = await fetch("/lobby/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId: code, username }),
    });

    const resBody = await res.json();

    if (!resBody.success) {
      showToast(resBody.error, "e");
      return;
    }

    globalThis.location.assign("/lobby");
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

const handleHost = async () => {
  const name = roomNameInput.value.trim();

  if (!name) {
    alert("Enter room name");
    return;
  }

  const username = localStorage.getItem("username");

  try {
    const res = await fetch("/lobby/host-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, username }),
    });

    const resBody = await res.json();

    if (resBody.success) {
      globalThis.location.assign("/lobby");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

joinActionBtn.addEventListener("click", handleJoin);

createActionBtn.addEventListener("click", handleHost);

attachListeners();
attachInputListener();
