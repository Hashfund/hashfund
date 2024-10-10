import clsx from "clsx";
import Link from "next/link";
import { MdWeb } from "react-icons/md";
import { Metadata, Mint } from "@hashfund/sdk/models";
import { FaDiscord, FaHashtag, FaTelegram, FaTwitter } from "react-icons/fa";

type SocialListProps = {
  className?: string;
  mint: Mint;
};

const mapSocialIcon = (type: Metadata["socials"][number]["type"]) => {
  switch (type) {
    case "twitter":
      return <FaTwitter className="text-xl text-blue" />;
      return;
    case "telegram":
      return <FaTelegram className="text-xl text-violet" />;
    case "discord":
      return <FaDiscord className="text-xl text-purple" />;
    default:
      return <FaHashtag className="text-xl" />;
  }
};

export default function SocialList({ className, mint }: SocialListProps) {
  return (
    <div className={clsx(className, "flex space-x-4 text-sm")}>
      {mint.metadata.socials.map((social, index) => {
        const icon = mapSocialIcon(social.type);
        return (
          <Link
            key={index}
            href={social.url}
            target="_blank"
            className="flex items-center rounded bg-dark p-2 space-x-2"
          >
            {icon}
            <span className="capitalize">{social.type}</span>
          </Link>
        );
      })}
      {mint.metadata.websites.map((website, index) => (
        <Link
          key={index}
          href={website.url}
          target="_blank"
          className="flex items-center rounded bg-dark p-2 space-x-2"
        >
          <MdWeb className="text-xl" />
          <span className="capitalize">{website.label}</span>
        </Link>
      ))}
    </div>
  );
}
