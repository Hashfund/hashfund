import { MenuItems, MenuItem } from "@headlessui/react";
import { useWallet } from "@solana/wallet-adapter-react";

import { truncateAddress } from "@/web3/address";
import { MdAccountCircle, MdLogout } from "react-icons/md";
import Link from "next/link";

export default function WalletPopover() {
  const { disconnect, publicKey } = useWallet();

  return (
    <MenuItems
      as="div"
      className="absolute right-0 mt-2 w-56 flex flex-col rounded bg-dark/50 p-2 outline-none backdrop-blur-3xl"
    >
      <MenuItem
        as={Link}
        href={`/profile?address=${publicKey?.toBase58()}`}
        className="flex items-center p-2 text-white/75 space-x-2 hover:text-white"
      >
        <MdAccountCircle className="text-xl" />
        <span>Edit Profile</span>
      </MenuItem>
      <MenuItem
        as="button"
        className="flex p-2 text-white/75 space-x-2 hover:text-white"
        onClick={disconnect}
      >
        <MdLogout className="text-xl" />
        <div className="flex flex-col">
          <span>Disconnect</span>
          <small className="text-xs text-white/50">
            {truncateAddress(publicKey!.toBase58())}
          </small>
        </div>
      </MenuItem>
    </MenuItems>
  );
}
