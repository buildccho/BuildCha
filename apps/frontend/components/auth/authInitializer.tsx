"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores";

type AuthInitializerProps = {
  children: React.ReactNode;
};

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
}
