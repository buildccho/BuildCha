"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores";

type AuthInitializerProps = {
  children: React.ReactNode;
};

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { checkSession } = useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    // 初回マウント時のみ実行
    if (!initializedRef.current) {
      initializedRef.current = true;
      checkSession();
    }
  }, [checkSession]);

  return <>{children}</>;
}
