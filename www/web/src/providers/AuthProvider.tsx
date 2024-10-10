import { useSDK } from "@/composables/useSDK";
import { Api } from "@/lib/api";
import type { User } from "@hashfund/sdk/models";
import { useWallet } from "@solana/wallet-adapter-react";
import { createContext, useEffect, useState } from "react";

type AuthContext = {
  user: User | null;
  setUser: (value: User | null) => void;
};

export const AuthContext = createContext<AuthContext>({
  user: null,
  setUser: () => void 0,
});

export default function AuthProvider({ children }: React.PropsWithChildren) {
  const { api } = useSDK();
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (publicKey)
      api.user.retrieve(publicKey.toBase58()).then(({ data }) => setUser(data));
  }, [publicKey]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
