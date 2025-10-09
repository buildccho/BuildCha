import { fetchUser } from "../api/users";
import { AuthenticatedProfileDialog } from "./authenticatedProfileDialog";
import { UserProfileCard } from "./userProfileCard";

export async function ProfileSection() {
  const user = await fetchUser();

  if (!user) {
    console.error(user);
    return null;
  }

  // 認証状態が確定してから表示
  return (
    <div className="z-30 max-w-sm w-full relative pt-5 pr-12 place-self-end shrink-0">
      <AuthenticatedProfileDialog user={user} />
      <UserProfileCard user={user} />
    </div>
  );
}
