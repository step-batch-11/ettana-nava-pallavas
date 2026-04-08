export default class Preset {
  static play(played, _id, _game) {
    played["preset"] = true;

    return { message: "Choose a color dice" };
  }

  static rollNumberDice(payload, currentPlayer, played, game) {
    if (!played["preset"]) {
      throw new Error("You didn't play preset action card");
    }

    const { diceValues, destinations } = game.upkeep(Number(payload.colorId));

    currentPlayer.removeActionCard(payload.cardId);
    delete played.preset;
    
    return {
      diceValues,
      destinations,
      message: "preset action card played successfully",
    };
  }
}
