import { useEffect, useState } from "react";
import { Program } from "@coral-xyz/anchor";
import { getConfigPda, Zeroboost } from "@hashfund/zeroboost";

export const useConfig = (program?: Program<Zeroboost>) => {  
  const [config, setConfig] =
    useState<
      Awaited<
        ReturnType<Program<Zeroboost>["account"]["config"]["fetch"]>
      >
    >();
  useEffect(() => {
    if (program) {
      const [config] = getConfigPda(program.programId);
      program.account.config.fetch(config).then(setConfig);
    }
  }, [program]);
  return config;
};
