export const truncateAddress = (address: any, length = 5) => {
  if (!address) return "";
  const str = address.toString();
  return str.slice(0, length) + "..." + str.slice(str.length - 5);
};
