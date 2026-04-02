export const gameStateController = (board, bank) => {
  return { board: board.board.getState(), bank, players: board.players };
};
