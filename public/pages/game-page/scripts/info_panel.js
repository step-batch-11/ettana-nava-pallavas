const banner = document.getElementById("actionBanner");
const text = document.getElementById("actionText");

let bannerTimeout;

export const showAction = (event, currentUserId) => {
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

const MAP_ACTION = {
  "PRESET": ({ actor }) => `${actor} has played Preset Action card `,
  "BUYDC": ({ actor }) => `🛒 ${actor} has bought a design card`,
  "BUYAC": ({ actor }) => `🎴 ${actor} has bought an action card`,
  "PAID_SWAP": ({ actor }) => `🔁 ${actor} has swapped two yarns`,
  "PASS_TURN": ({ actor }) => `${actor} has passed turn`,
  "TAX": ({ actor }) => `💸 ${actor} has collected tax from all players`,
  "VICTORY_POINT": ({ actor }) => `🏆 ${actor} has gained a victory point`,
  "MOVE_ACTION": ({ actor }) => `${actor} has moved using Move Action card!`,
  "STEAL_TOKENS": ({ actor, value, target }) =>
    `💰 ${actor} has stolen ${value} tokens from ${target}`,
  "STEAL_ACTION": ({ actor, target }) =>
    `💰 ${actor} has stolen 1 Action card from ${target}`,
  "CLAIM_DESIGN": ({ actor, value }) =>
    `🧵 ${actor} has completed a design ${value} VP`,
  "REPLACE_YARN": ({ actor }) =>
    `${actor} has replaced yarn using Replace Action card!`,
  "REPLACE_TILE": ({ actor }) =>
    `${actor} has replaced tile using Replace Action card!`,
  "GAIN_TOKEN": ({ actor }) =>
    `${actor} has gained tokens using Gain Token Action card!`,
  "SWAP_ACTION": ({ actor }) =>
    `${actor} has swapped yarns using Swap Action card!`,
};

const formatEvent = (event, currentUserId) => {
  const actor = event.actor.id === currentUserId ? "You" : event.actor.name;
  const target = event.target?.id === currentUserId
    ? "You"
    : event.target?.name;

  if (!(event.type in MAP_ACTION)) {
    return `🎮 ${actor} performed an action`;
  }

  return MAP_ACTION[event.type]({ actor, target, value: event.info.value });
};
