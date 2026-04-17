import { useState, useEffect } from "react";
import type { MintWithExtra } from "@hashfund/sdk/models";
import { getTokenLargeAccounts } from "@/actions/getTokenLargeAccounts";

export function useTokenHolders(mint: MintWithExtra) {
  const [holders, setHolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHolders = async () => {
      setLoading(true);
      try {
        const data = await getTokenLargeAccounts(mint);
        if (isMounted) {
          setHolders(data);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to fetch token holders:", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (mint) {
      fetchHolders();
    }

    return () => {
      isMounted = false;
    };
  }, [mint]);

  return { holders, loading, error };
}
