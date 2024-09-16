import { uploadFile } from "@/lib/imagekit";

type CreateTokenMetadata = {
  name: string;
  symbol: string;
  image: File;
  description: string;
  website?: string;
  telegram?: string;
  twitter?: string;
};

export const createTokenRichMetadata = async (
  {
    name,
    symbol,
    image,
    description,
    telegram,
    twitter,
    website,
  }: CreateTokenMetadata,
  nonce: string
) => {
  const path = (value: string) => `tokens/${value}/${nonce}`;
  const imageLink = (await uploadFile(image, path("images") + ".png")).url;

  const richMetadata = JSON.stringify({
    name,
    symbol,
    description,
    image: imageLink,
    external_link: website,
    properties: {
      files: [],
    },
    socials: {
      telegram,
      twitter,
    },
  });

  const file = new Blob([richMetadata], { type: "application/json" });

  return (await uploadFile(file, path("metadata") + ".json")).url;
};

export const avatarOrDefault = function (src: string | null | undefined) {
  return src ?? "/avatar/3d.png";
};
