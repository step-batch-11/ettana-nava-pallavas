export const serveBankState = (context) => {
  const bank = context.get("bank");
  const bankState = bank.getBank();

  return context.json(bankState);
};

export const buyDesignCard = (context) => {
  try {
    const bank = context.get("bank");
    const boardState = context.get("boardState");
    const card = bank.buyDesignCard();
    const currentPlayerId = boardState.players.findIndex((player) =>
      player.id === boardState.currentPlayer
    );
    
    boardState.players[currentPlayerId].designCards.push(card);

    return context.json(card);
  } catch (err) {
    return context.json({ hasError: true, error: err.message });
  }
};
