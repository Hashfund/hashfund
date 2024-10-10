"use client";
import clsx from "clsx";

import { useRef } from "react";
import { MdSearch } from "react-icons/md";
import { useSearchParams, useRouter } from "next/navigation";

type SearchInputProps = {
  qKey: string;
  className?: string;
};

export default function SearchInput({ qKey, className }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const timer = useRef<number>();

  return (
    <div
      className={clsx(
        className,
        "flex space-x-2 items-center bg-dark-700 px-2 rounded-md"
      )}
    >
      <div>
        <MdSearch className="text-xl text-white/50" />
      </div>
      <div className="flex-1">
        <input
          className="py-3"
          placeholder="Search by mint address, name, ticker"
          onChange={(event) => {
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => {
              const value = event.target.value;
              const q = new URLSearchParams(searchParams);
              q.set(qKey, value);

              router.replace("?" + q.toString());
            }, 500);
          }}
        />
      </div>
    </div>
  );
}
