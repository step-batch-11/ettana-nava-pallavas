export const tax = (game, bank) => {
  let tokens = 0;
  game.players.forEach((player) => {
    if (player.id !== game.currentPlayer && player.tokens > 0) {
      player.tokens -= 1;
      tokens++;
    }
  });

  bank.incrementTokens(tokens);
};
