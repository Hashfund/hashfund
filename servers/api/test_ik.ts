import "dotenv/config";
import ImageKit from "imagekit";

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

console.log("Public Key defined:", !!IMAGEKIT_PUBLIC_KEY);
console.log("Private Key defined:", !!IMAGEKIT_PRIVATE_KEY);
console.log("URL Endpoint defined:", !!IMAGEKIT_URL_ENDPOINT);

try {
  const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY!,
    privateKey: IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT!,
  });
  const auth = imagekit.getAuthenticationParameters();
  console.log("Auth params generated successfully:", !!auth.signature);
} catch (err) {
  console.error("ImageKit failure:", err);
}
