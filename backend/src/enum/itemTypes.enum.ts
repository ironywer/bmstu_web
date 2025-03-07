export const isValidItemQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity >= 0;
};
