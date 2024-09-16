import { RouteProps } from "@/types";
import useUser from "@/composables/api/useUser";
import { useMints } from "@/composables/api/useMints";
import useUserTokens from "@/composables/api/useUserTokens";
import { ProfileHeader, ProfileTab } from "@/components/profile";

export default async function ProfilePage({
  searchParams: { address },
}: RouteProps) {
  const user = await useUser(address);
  const { mints } = await useMints({ creator: address });
  const { tokens } = await useUserTokens(address);

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
