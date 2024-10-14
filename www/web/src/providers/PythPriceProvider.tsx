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

import { mapFeed } from "@/web3";

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
  priceFeeds?: ReturnType<typeof mapFeed>[];
  pythEndpoint: string;
} & React.PropsWithChildren;

export default function PythPriceProvider({
  feeds,
  priceFeeds,
  children,
  pythEndpoint,
}: PythPriceProviderProps) {
  const connection = useMemo(
    () => new PriceServiceConnection(pythEndpoint),
    []
  );
  const [price, setPrice] = useState<Map<string, number>>(new Map(priceFeeds));

  const onUpdate = (priceFeed: PriceFeed) => {
    const [id, amount] = mapFeed(priceFeed);
    const newValue = Number(amount.toFixed(2));

    setPrice((price) => {
      const value = price.get(id);
      if (value && value === newValue) return price;
      price.set(id, newValue);
      return new Map(price);
    });
  };

  const getPrice = useCallback((id: string) => price.get(id) ?? 0, [price]);

  useEffect(() => {
    const feedIds = feeds.map((feed) => feed);
    connection.getLatestPriceFeeds(feedIds).then((priceFeeds) => {
      if (priceFeeds) priceFeeds.forEach(onUpdate);
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
