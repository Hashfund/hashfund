"use client";

import Image from "next/image";
import { MdSquare, MdDiamond } from "react-icons/md";

import useAuth from "@/composables/useAuth";
import { avatarOrDefault } from "@/web3/asset";
import { User } from "@/lib/api/models/user.model";

import EditProfile from "./EditProfile";

type ProfileHeaderProps = {
  user: User;
  mints: number;
  tokens: number;
};

export function ProfileHeader({ user, mints, tokens }: ProfileHeaderProps) {
  const { user: me } = useAuth();
  const isMe = me?.id === user.id;

  return (
    <section
      className="flex px-4 space-x-4"
      md="px-8"
    >
      <div>
        <Image
          src={avatarOrDefault(isMe ? me.avatar : user.avatar)}
          width={128}
          height={128}
          alt={user.name}
          className="h-12 w-12 rounded-full"
        />
      </div>
      <div className="flex flex-col space-y-2">
        <div>
          <h1>{isMe ? me.name : user.name}</h1>
          <div className="flex space-x-4">
            <div className="flex items-center text-green space-x-1">
              <MdSquare />
              <span>{mints} Mints</span>
            </div>
            <div className="flex items-center text-purple space-x-1">
              <MdDiamond />
              <span>{tokens} Tokens</span>
            </div>
          </div>
        </div>
        {isMe && <EditProfile />}
      </div>
    </section>
  );
}
