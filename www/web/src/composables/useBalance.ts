import { useContext } from "react";
import { BalanceContext } from "@/providers/BalanceProvider";

export default function useBalance() {
  return useContext(BalanceContext);
}
