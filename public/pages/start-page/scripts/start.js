const scrollBtn = document.querySelector(".scroll-btn");
const pageContainer = document.querySelector(".page");

pageContainer.addEventListener("scroll", () => {
  if (pageContainer.scrollTop > globalThis.innerHeight / 2) {
    scrollBtn.classList.remove("pointing-down");
    scrollBtn.classList.add("pointing-up");
  } else {
    scrollBtn.classList.remove("pointing-up");
    scrollBtn.classList.add("pointing-down");
  }
});

scrollBtn.addEventListener("click", () => {
  if (scrollBtn.classList.contains("pointing-up")) {
    pageContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } else {
    pageContainer.scrollTo({
      top: pageContainer.scrollHeight,
      behavior: "smooth",
    });
  }
});

pageContainer.dispatchEvent(new Event("scroll"));
