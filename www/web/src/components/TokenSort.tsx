"use client";

import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MdArrowDropDown, MdCheck } from "react-icons/md";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

const sorts = {
  marketCap: "Market Cap",
  maxMarketCap: "Max Marketcap",
  volumeIn: "Volume",
  price: "Price",
  timestamp: "Created At",
};

export default function TokenSort() {
  const searchParams = useSearchParams();
  const sortBy = searchParams.get("token_sort_by") ?? "marketCap";

  return (
    <Menu
      as="div"
      className="relative"
    >
      <MenuButton className="w-40 flex border border-dark rounded p-2 text-white/75">
        <span className="flex-1 text-left">
          {sorts[sortBy as unknown as keyof typeof sorts]}
        </span>
        <MdArrowDropDown className="text-xl" />
      </MenuButton>
      <MenuItems className="absolute right-0 min-w-48 flex flex-col rounded bg-dark-500/50 backdrop-blur-sm divide-y divide-dark-100">
        {Object.entries(sorts).map(([key, value]) => {
          const isActive = sortBy === key;
          const q = new URLSearchParams(searchParams);
          q.set("token_sort_by", key);

          return (
            <MenuItem
              key={key}
              as={Link}
              className={clsx("flex space-x-2 text-left px-4 py-2", {
                "text-primary": isActive,
              })}
              href={`?${q.toString()}`}
            >
              {isActive && <MdCheck className="text-xl" />}
              <span> {value}</span>
            </MenuItem>
          );
        })}
      </MenuItems>
    </Menu>
  );
}
