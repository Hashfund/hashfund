import Api from "@hashfund/sdk";
import ImageKit from "imagekit-javascript";

import { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL } from "@/config";

export const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: IMAGEKIT_URL,
});

export const uploadFile = async (
  api: Api,
  file: string | Blob | File,
  fileName: string,
  tags?: string[]
) => {
  const { data: authParams } = await api.imagekit.getAuthenticationParameters();
  return imagekit.upload({
    file,
    fileName,
    tags,
    token: authParams.token,
    signature: authParams.signature,
    expire: authParams.expire,
    useUniqueFileName: false,
  });
};
