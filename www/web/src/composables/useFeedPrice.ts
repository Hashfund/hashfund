import { useContext } from "react";
import { PythPriceContext } from "@/providers/PythPriceProvider";

export const  useFeedPrice = (id: string) => {
  const { price, getPrice } = useContext(PythPriceContext);

  return getPrice(id);
}