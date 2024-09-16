import { useContext } from "react";
import { NavigationContext } from "@/providers/NavigationProvider";

export default function useNavigation() {
  return useContext(NavigationContext);
}
