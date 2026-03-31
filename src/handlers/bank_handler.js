export const serveBankState = (context) => {
  const bank = context.get("bank");
  const bankState = bank.getBank();

  return context.json(bankState);
};

export const buyDesignCard = (context) => {
  try {
    const bank = context.get("bank");
    const card = bank.buyDesignCard();
    return context.json(card);
  } catch (err) {
    return context.json({ hasError: true, error: err.message });
  }
};
