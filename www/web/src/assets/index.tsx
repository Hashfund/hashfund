import Image from "next/image";
import IcBoostAsset from "./icons/ic_boost.png";

export function IcBoost(
  props: Omit<React.ComponentProps<typeof Image>, "src">
) {
  return (
    <Image
      {...props}
      src={IcBoostAsset}
    />
  );
}

import IcCoinAsset from "./icons/ic_coin.png";

export function IcCoin(props: Omit<React.ComponentProps<typeof Image>, "src">) {
  return (
    <Image
      {...props}
      src={IcCoinAsset}
    />
  );
}

import IcLogoAsset from "./icons/ic_logo.png";

export function IcLogo(props: Omit<React.ComponentProps<typeof Image>, "src">) {
  return (
    <Image
      {...props}
      src={IcLogoAsset}
    />
  );
}

import IcTrophyAsset from "./icons/ic_trophy.png";

export function IcTrophy(
  props: Omit<React.ComponentProps<typeof Image>, "src">
) {
  return (
    <Image
      {...props}
      src={IcTrophyAsset}
    />
  );
}
