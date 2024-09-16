export type BoundingCurve = {
  id: string;
  mint: string;
  maximumMarketCap: string;
  initialPrice: number;
  timestamp: string;
  curveInitialSupply: string;
};

export type Hash = {
  id: number;
  amm: string;
  market?: string;
};

export type Mint = {
  id: string;
  name: string;
  ticker: string;
  creator: string;
  timestamp: string;
  canTrade: boolean;
  metadata: {
    name: string;
    symbol: string;
    image: string;
    description: string;
    external_url: string;
    properties: [
      files: [
        {
          type: string;
          uri: string;
        }
      ]
    ];
    socials: {
      telegram?: string;
      twitter?: string;
    };
  };
  hash?: Hash;
  marketCap: string;
  virtualMarketCap: string;
  totalSupply: string;
  boundingCurve: BoundingCurve;
  volumeIn: string;
  volumeOut: string;
  volumeInFrom: string;
  volumeOutFrom: string;
  signature: string;
};
