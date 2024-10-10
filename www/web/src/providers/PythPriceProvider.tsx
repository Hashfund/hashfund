import {
  PriceFeed,
  PriceServiceConnection,
} from "@pythnetwork/price-service-client";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { PYTH_ENPOINT_URL } from "@/config";
import { priceToNumber } from "@/web3/math";

type PythPriceContext = {
  price: Map<string, number>;
  getPrice: (feed: string) => number;
};

export const PythPriceContext = createContext<PythPriceContext>({
  price: new Map(),
  getPrice: () => 0,
});

type PythPriceProviderProps = {
  feeds: string[];
} & React.PropsWithChildren;

export default function PythPriceProvider({
  feeds,
  children,
}: PythPriceProviderProps) {
  const connection = useMemo(
    () => new PriceServiceConnection(PYTH_ENPOINT_URL),
    []
  );
  const [price, setPrice] = useState<Map<string, number>>(new Map());

  const onUpdate = (priceFeed: PriceFeed) => {
    const id = "0x" + priceFeed.id;
    const amount = priceToNumber(priceFeed.getEmaPriceUnchecked());

    setPrice((price) => {
      const value = price.get(id);
      const newValue = Number(amount.toFixed(2));
      if (value && value === newValue) return price;
      price.set(id, newValue);
      return new Map(price);
    });
  };

  const getPrice = useCallback((id: string) => price.get(id) ?? 0, [price]);

  useEffect(() => {
    const feedIds = feeds.map((feed) => feed);
    connection.getLatestPriceFeeds(feedIds).then((priceFeeds) => {
      priceFeeds?.map(onUpdate);
    });

    connection.subscribePriceFeedUpdates(feedIds, onUpdate);

    return () => {
      connection.unsubscribePriceFeedUpdates(feedIds);
    };
  }, [feeds]);

  return (
    <PythPriceContext.Provider value={{ price, getPrice }}>
      {children}
    </PythPriceContext.Provider>
  );
}
