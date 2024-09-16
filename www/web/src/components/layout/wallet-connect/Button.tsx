"use client";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { Popover, PopoverButton, MenuButton, Menu } from "@headlessui/react";

import { truncateAddress } from "@/web3/address";
import Modal from "./Modal";
import WalletPopover from "./Popover";

export default function Button() {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  let Button = connected ? MenuButton : PopoverButton;

  return (
    <Popover>
      <Menu
        as="div"
        className="relative"
      >
        <Button className="btn btn-primary flex truncate outline-none space-x-2">
          {wallet && publicKey ? (
            <>
              <Image
                src={wallet.adapter.icon}
                alt={wallet.adapter.name}
                width={24}
                height={24}
              />
              {publicKey && (
                <span>{truncateAddress(publicKey.toBase58())}</span>
              )}
            </>
          ) : (
            <>
              Connect&nbsp;<span className="lt-md:hidden"> Wallet</span>
            </>
          )}
        </Button>
        {connected && <WalletPopover />}
      </Menu>
      {!connected && <Modal />}
    </Popover>
  );
}
