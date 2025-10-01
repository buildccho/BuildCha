"use client";

import { useAuthStore } from "@/stores";
import { AuthenticatedProfileDialog } from "./authenticatedProfileDialog";
import { SignInButton } from "./signInButton";
import { UserProfileCard } from "./userProfileCard";

export function ProfileSection() {
  const { loading, isAuthenticated, user } = useAuthStore();

  // 認証初期化中はローディング表示
  if (loading) {
    return (
      <div className="z-30 max-w-sm w-full relative pt-5 pr-12 place-self-end shrink-0">
        <div className="bg-neutral-200 border-4 border-white shadow size-20 absolute top-0 right-0 z-40 rounded-full animate-pulse" />
        <div className="bg-white/65 border border-white backdrop-blur-md rounded-xl px-2 py-0.5 w-full divide-y divide-foreground/15">
          <div className="flex items-center gap-6 w-full py-2 px-2">
            <div className="text-sm shrink-0">
              作った数 <span className="font-semibold text-2xl ml-1">-</span>
            </div>
            <div className="font-bold w-full text-center bg-gray-200 animate-pulse rounded h-6" />
          </div>
          <div className="flex items-center gap-6 w-full py-2 px-2">
            <div className="text-sm shrink-0">
              レベル <span className="font-semibold text-2xl ml-1">-</span>
            </div>
            <div className="bg-gray-200 animate-pulse rounded h-2 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // 認証状態が確定してから表示
  return (
    <div className="z-30 max-w-sm w-full relative pt-5 pr-12 place-self-end shrink-0">
      {isAuthenticated && user ? (
        <AuthenticatedProfileDialog user={user} />
      ) : (
        <SignInButton />
      )}
      <UserProfileCard />
    </div>
  );
}
