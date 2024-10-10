import { useContext } from "react";
import { ProgramContext } from "@/providers/ProgramProvider";

export const useProgram = () =>
  useContext(
    ProgramContext
  ) as  import("../providers/ProgramProvider.tsx").ProgramContext;
