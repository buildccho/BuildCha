"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores";

type AuthInitializerProps = {
  children: React.ReactNode;
};

export function AuthInitializer({ children }: AuthInitializerProps) {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    // アプリ起動時に一度だけセッション確認
    checkSession();
  }, [checkSession]);

  return <>{children}</>;
}
