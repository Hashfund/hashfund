export const formatPrice = function (amount: number, currency = "USD") {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: amount < 0.1 ? (amount === 0 ? 2 : 10) : 2,
    maximumFractionDigits: amount < 0.1 ? (amount === 0 ? 2 : 10) : 2,
  }).format(amount);
};
