export type Metadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  websites: { label: string; url: string }[];
  socials: { url: string; type: "twitter" | "telegram" | "discord" | (string & {}) }[];
};
