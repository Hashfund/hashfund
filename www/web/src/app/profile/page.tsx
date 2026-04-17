import { RouteProps } from "@/types";

import { ProfileHeader, ProfileTab } from "@/components/profile";
import { Api } from "@/lib/api";

export default async function ProfilePage({
  searchParams: { address },
}: RouteProps) {
  const user = await Api.instance.user.retrieve(address).then(({data}) => data).catch(() => ({} as any));
  const mints = await Api.instance.mint.list({ creator: address }).then(({data}) => data.results).catch(() => []);
  const tokens  = await Api.instance.mint.getMintByUser( address).then(({data}) => data.results).catch(() => []);

  return (
    <main className="flex flex-col space-y-8">
      <ProfileHeader
        user={user}
        mints={mints.length}
        tokens={tokens.length}
      />
      <ProfileTab
        className="flex-1"
        mints={mints}
        tokens={tokens}
      />
    </main>
  );
}
