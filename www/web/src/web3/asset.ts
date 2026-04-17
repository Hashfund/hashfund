import Api from "@hashfund/sdk";
import { uploadFile } from "@/lib/imagekit";

type CreateTokenMetadata = {
  name: string;
  symbol: string;
  image: File;
  description: string;
  website?: string;
  telegram?: string;
  x?: string;
  tiktok?: string;
  instagram?: string;
};

export const createTokenRichMetadata = async (
  api: Api,
  {
    name,
    symbol,
    image,
    description,
    telegram,
    x,
    tiktok,
    instagram,
    website,
  }: CreateTokenMetadata,
  nonce: string
) => {
  const path = (value: string) => `tokens/${value}/${nonce}`;
  const imageLink = (await uploadFile(api, image, path("images") + ".png")).url;

  const richMetadata = JSON.stringify({
    name,
    symbol,
    description,
    image: imageLink,
    properties: {
      files: [],
    },
    websites: [
      { label: "Website", url: website }
    ].filter(w => w.url),
    socials: [
      { type: "Telegram", url: telegram },
      { type: "twitter", url: x },
      { type: "tiktok", url: tiktok },
      { type: "instagram", url: instagram },
    ].filter(social => social.url),
  });

  const file = new Blob([richMetadata], { type: "application/json" });

  return (await uploadFile(api, file, path("metadata") + ".json")).url;
};

export const avatarOrDefault = function (src: string | null | undefined) {
  return src ?? "/avatar/3d.png";
};
