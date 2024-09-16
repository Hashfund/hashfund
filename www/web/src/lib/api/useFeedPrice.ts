import { useContext } from "react";
import { PythPriceContext } from "@/providers/PythPriceProvider";

export default function useFeedPrice(id: string) {
  const { price, getPrice } = useContext(PythPriceContext);

  return getPrice(id);
}
