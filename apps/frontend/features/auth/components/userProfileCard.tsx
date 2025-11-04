"use client";

import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores";

export function UserProfileCard() {
  const { user, isAuthenticated } = useAuthStore();

  const LEVEL_COEFFICIENT = 0.02;
  const currentLevelStartScore = Math.floor(
    (user?.level || 0) / LEVEL_COEFFICIENT,
  );
  const nextLevelScore = Math.floor(
    ((user?.level || 0) + 1) / LEVEL_COEFFICIENT,
  );
  const scoreInCurrentLevel = (user?.score || 0) - currentLevelStartScore;
  const scoreNeededForNextLevel = nextLevelScore - currentLevelStartScore;
  const progressPercentage =
    scoreNeededForNextLevel > 0
      ? (scoreInCurrentLevel / scoreNeededForNextLevel) * 100
      : 0;

  return (
    <div className="bg-white/65 border border-white backdrop-blur-md rounded-xl px-2 py-0.5 w-full divide-y divide-foreground/15">
      <div className="flex items-center gap-6 w-full py-2 px-2">
        <div className="text-sm shrink-0">
          作った数{" "}
          <span className="font-semibold text-2xl ml-1">
            {user?.userObjectCount || 0}
          </span>
        </div>
        <div className="font-bold w-full text-center">
          {isAuthenticated && user ? user.name || "匿名ユーザー" : "ゲスト"}
        </div>
      </div>
      <div className="flex items-center gap-6 w-full py-2 px-2">
        <div className="text-sm shrink-0">
          レベル{" "}
          <span className="font-semibold text-2xl ml-1">
            {user?.level || 0}
          </span>
        </div>
        <Progress value={progressPercentage} />
      </div>
    </div>
  );
}
