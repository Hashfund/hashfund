import clsx from "clsx";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";

import { Mint } from "@/lib/api/models";
import { TokenList } from "../TokenList";

type ProfileTabProps = {
  className?: string;
  mints: Mint[];
  tokens: Mint[];
};

export function ProfileTab({ className, mints, tokens }: ProfileTabProps) {
  return (
    <TabGroup className={clsx(className, "flex flex-col")}>
      <TabList
        className="self-start px-4"
        md="py-8"
      >
        <div className="flex rounded-md bg-dark p-2">
          <Tab className="rounded px-4 py-1 outline-none data-[selected]:bg-amber data-[selected]:text-black">
            Mints
          </Tab>
          <Tab className="rounded px-4 py-1 outline-none data-[selected]:bg-amber data-[selected]:text-black">
            Tokens
          </Tab>
        </div>
      </TabList>
      <TabPanels className="flex flex-1 overflow-x-scroll">
        <TabPanel className="flex-1 overflow-x-scroll">
          <TokenList
            className="px-4 md:px-8"
            mints={mints}
          />
        </TabPanel>
        <TabPanel className="flex-1 overflow-x-scroll">
          <TokenList
            className="px-4 md:px-8"
            mints={tokens}
          />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
