import { useWallet } from "@solana/wallet-adapter-react";

import Image from "next/image";
import { MdWallet } from "react-icons/md";
import { PopoverPanel } from "@headlessui/react";

export default function WalletModal() {
  const { wallets, select } = useWallet();

  return (
    <PopoverPanel
      className="absolute right-1/18 z-10 h-1/2 w-3/4 overflow-y-scroll rounded bg-dark-950/50 p-4 backdrop-blur-xl"
      md="right-2 w-1/2"
      xl="w-1/3"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="items-center rounded bg-primary p-2 text-black">
            <MdWallet className="text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-primary font-bold md:text-xl">
              Connect Wallet
            </h1>
            <p className="text-sm text-white/80">
              Choose the wallet you want to connect
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {wallets.map((wallet, index) => (
            <button
              key={index}
              className="flex items-center border-1 border-transparent rounded bg-dark-700/50 p-3 space-x-4 hover:border-primary hover:bg-primary/20"
              onClick={() => select(wallet.adapter.name)}
            >
              <div>
                <Image
                  src={wallet.adapter.icon}
                  width={32}
                  height={32}
                  alt={wallet.adapter.name}
                />
              </div>
              <div>
                <p>{wallet.adapter.name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PopoverPanel>
  );
}
