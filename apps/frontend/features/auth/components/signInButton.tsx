"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      className="bg-neutral-200 border-4 border-white shadow size-20 absolute top-0 right-0 z-40 rounded-full p-0"
      variant="ghost"
      asChild
    >
      <Link href="/start">
        <LogIn className="size-8 text-gray-600" />
      </Link>
    </Button>
  );
}
