const SUCCESSCOLOR = "#22c55e";
const ERRORCOLOR = "#ef4444";

export const showToast = (message, type) => {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.style.background = type === "e" ? ERRORCOLOR : SUCCESSCOLOR;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
};
