export const formatPrice = function (amount: number, currency = "USD") {
  return Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
};
