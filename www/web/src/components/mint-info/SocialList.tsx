import clsx from "clsx";
import Link from "next/link";
import { MdWeb } from "react-icons/md";
import { FaTelegram, FaTwitter } from "react-icons/fa";

import { Mint } from "@/lib/api/models";

type SocialListProps = {
  className?: string;
  mint: Mint;
};

export default function SocialList({ className, mint }: SocialListProps) {
  return (
    <div className={clsx(className, "flex space-x-4 text-sm")}>
      {mint.metadata.socials.telegram && (
        <Link
          href={mint.metadata.socials.telegram}
          target="_blank"
          className="flex items-center rounded bg-dark p-2 space-x-2"
        >
          <FaTelegram className="text-xl text-purple" />
          <span>Telegram</span>
        </Link>
      )}
      {mint.metadata.socials.twitter && (
        <Link
          href={mint.metadata.socials.twitter}
          target="_blank"
          className="flex items-center rounded bg-dark p-2 space-x-2"
        >
          <FaTwitter className="text-xl text-blue" />
          <span>Twitter</span>
        </Link>
      )}
      {mint.metadata.external_url && (
        <Link
          href={mint.metadata.external_url}
          target="_blank"
          className="flex items-center rounded bg-dark p-2 space-x-2"
        >
          <MdWeb className="text-xl" />
          <span>Website</span>
        </Link>
      )}
    </div>
  );
}
