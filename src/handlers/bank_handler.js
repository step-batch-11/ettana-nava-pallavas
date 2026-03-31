export const serveBankState = (context) => {
  const bank = context.get("bank");
  const bankState = bank.getBank();

  return context.json(bankState);
};
