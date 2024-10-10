import { useContext } from "react";
import { SDKContext } from "@/providers/SDKProvider";

export const useSDK = () =>
  useContext(
    SDKContext
  ) as import("../providers/SDKProvider").SDKContext;
