"use client";

import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores";

export function SignInButton() {
  const { signIn } = useAuthStore();

  return (
    <Button
      onClick={signIn}
      className="bg-neutral-200 border-4 border-white shadow size-20 absolute top-0 right-0 z-40 rounded-full p-0"
      variant="ghost"
    >
      <LogIn className="size-8 text-gray-600" />
    </Button>
  );
}
