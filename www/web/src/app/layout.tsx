import "@unocss/reset/tailwind.css";
import "react-toastify/dist/ReactToastify.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import clsx from "clsx";
import { devnet } from "@hashfund/zeroboost";

import type { Metadata, Viewport } from "next";
import { ToastContainer } from "react-toastify";

import "@/globals.css";
import { RPC_URL } from "@/config";
import Provider from "@/providers";
import { defaultFont } from "@/assets/font";
import { Navigation, Toolbar } from "@/components/layout";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://" + (process.env.VERCEL_URL ?? process.env.RENDER_EXTERNAL_URL)!
  ),
  title: "HashFund | Launch a coin that is instantly tradeable",
  description:
    "HashFund prevents rugs by making sure that all created tokens are safe. Eacg coin on hashfund is a fair-launch with no presale and no team allocation.",
  openGraph: {
    images: [],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body
        className={clsx(
          defaultFont.className,
          "fixed inset-0 flex bg-dark-950  text-amber-50 text-[15px] md:text-sm overflow-y-scroll overflow-x-hidden"
        )}
        lt-md="flex-col"
      >
        <Provider
          rpcEndpoint={RPC_URL}
          zeroboostProgram={devnet.ZERO_BOOST_PROGRAM.toBase58()}
        >
          <Navigation className="border-dark lt-md:order-last lt-md:border-t-1 md:border-r-1" />
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-scroll space-y-8">
            <Toolbar />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </Provider>
        <ToastContainer />
      </body>
    </html>
  );
}
