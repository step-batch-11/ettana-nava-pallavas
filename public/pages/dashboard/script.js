
const banner = document.getElementById("actionBanner");
const text = document.getElementById("actionText");

let bannerTimeout;
const showAction = (event, type) => {
  if (bannerTimeout) clearTimeout(bannerTimeout);

  text.innerText = event;

  const color = type === "e" ? "error" : "";
  banner.classList.remove("hidden");
  banner.classList.add("show", "animate", color);

  setTimeout(() => {
    banner.classList.remove("animate");
  }, 300);

  bannerTimeout = setTimeout(() => {
    banner.classList.remove("show");
  }, 3000);
};

const joinPopup = document.getElementById("joinPopup");
const createPopup = document.getElementById("createPopup");

document.getElementById("joinBtn").onclick = () =>
  joinPopup.classList.remove("hidden");

document.getElementById("createBtn").onclick = () =>
  createPopup.classList.remove("hidden");

document.getElementById("closeJoin").onclick = () =>
  joinPopup.classList.add("hidden");

document.getElementById("closeCreate").onclick = () =>
  createPopup.classList.add("hidden");

const inputs = document.querySelectorAll("#joinInputs input");
const roomNameInput = document.getElementById("roomName");

inputs[0]?.focus();

inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    e.target.value = value;

    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (!input.value && index > 0) {
        inputs[index - 1].focus();
      }
    }
  });

  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

    data.split("").forEach((char, i) => {
      if (inputs[i]) inputs[i].value = char;
    });

    const last = Math.min(data.length - 1, inputs.length - 1);
    inputs[last]?.focus();
  });
});

const handleJoin = async () => {
  const code = Array.from(inputs).map((i) => i.value).join("");

  if (code.length < inputs.length) {
    showAction("Enter full code", "e");
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
      showAction(resBody.error, "e");
      return;
    }

    globalThis.location.assign("/lobby");
  } catch (err) {
    console.error(err);
    showAction("Something went wrong", "e");
  }
};

const handleHost = async () => {
  const name = roomNameInput.value.trim();

  if (!name) {
    showAction("Enter room name", "e");
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
    } else {
      showAction(resBody.error || "Failed to create room", "e");
    }
  } catch (err) {
    console.error(err);
    showAction("Something went wrong", "e");
  }
};

document.getElementById("joinAction").onclick = handleJoin;
document.getElementById("createAction").onclick = handleHost;
