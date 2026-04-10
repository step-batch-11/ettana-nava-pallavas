const banner = document.getElementById("actionBanner");
const text = document.getElementById("actionText");

let bannerTimeout;

export const showAction = (event, currentUserId) => {
  console.log({event});
  
  if (bannerTimeout) clearTimeout(bannerTimeout);

  text.innerText = formatEvent(event, currentUserId);

  banner.classList.remove("hidden");
  banner.classList.add("show", "animate");

  setTimeout(() => {
    banner.classList.remove("animate");
  }, 300);

  bannerTimeout = setTimeout(() => {
    banner.classList.remove("show");
  }, 3000);
};

const formatEvent = (event, currentUserId) => {
  console.log({event});
  
  const actor = event.actor.id === currentUserId ? "You" : event.actor.name;
  const target = event.target?.id === currentUserId
    ? "You"
    : event.target?.name;

  switch (event.type) {
    case "STEAL_TOKENS":
      return `💰 ${actor} stole ${event.value} tokens from ${target}`;

    case "CLAIM_DESIGN":
      return `🧵 ${actor} completed a design (+${event.value} VP)`;

    case "BUY_DESIGN":
      return `🛒 ${actor} bought a design card`;

    case "BUY_ACTION":
      return `🎴 ${actor} bought an action card`;

    case "PAID_SWAP":
      return `🔁 ${actor} swapped two yarns`;

    case "TAX":
      return `💸 ${actor} collected tax from all players`;

    case "VICTORY_POINT":
      return `🏆 ${actor} gained a victory point`;

    case "GAME_END":
      return `🏆 ${actor} won the game!`;

    default:
      return `🎮 ${actor} performed an action`;
  }
};


