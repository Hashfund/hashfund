"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaQuestionCircle } from "react-icons/fa";

import { IcLogo } from "@/assets";
import { layoutNavigations } from "@/config";

type NavigationProps = {
  className?: string;
};

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={clsx(className, "flex")}
      md="flex-col p-2 space-y-4 bg-dark-900 min-w-64"
    >
      <Link
        href="/"
        lt-md="hidden"
      >
        <IcLogo
          alt="Hashfund"
          width={64}
          height={64}
        />
      </Link>
      <ol
        className="flex flex-1"
        lt-md="items-center"
        md="flex-col space-y-4"
      >
        {layoutNavigations.map((navigation) => {
          const isActive = navigation.href === pathname;

          return (
            <Link
              key={navigation.name}
              href={navigation.href}
              className={clsx(
                "flex p-2 cursor-pointer text-sm hover:text-primary",
                isActive ? "text-primary" : "text-white/75"
              )}
              lt-md="flex-1 flex flex-col items-center justify-center"
              md="space-x-2"
            >
              <navigation.icon className="text-xl md:text-xl" />
              <p>{navigation.name}</p>
            </Link>
          );
        })}
      </ol>
      <ol
        className="flex flex-col"
        lt-md="hidden"
      >
        <li className="flex cursor-pointer p-2 text-white/75 space-x-2">
          <FaQuestionCircle className="text-2xl" />
          <p>Support</p>
        </li>
      </ol>
    </nav>
  );
}
