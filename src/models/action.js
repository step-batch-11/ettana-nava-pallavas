const removeCard = (player, id) => {
  const index = player.actionCards.findIndex((card) => card.id === id);
  player.actionCards.splice(index, 1);
};

export const tax = (game, bank, id) => {
  let tokens = 0;
  game.players.forEach((player) => {
    if (player.id !== game.currentPlayer && player.tokens > 0) {
      player.tokens -= 1;
      tokens++;
    }
  });

  const currentPlayer = game.players.find((player) =>
    player.id === game.currentPlayer
  );

  removeCard(currentPlayer, id);
  bank.incrementTokens(tokens);
};
