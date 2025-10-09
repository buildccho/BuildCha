import { cookies } from "next/headers";
import { client } from "@/lib/rpc-client";

/**
 * 現在のユーザー情報を取得
 * Server Componentから使用
 */
export async function fetchUser() {
  const cookieStore = await cookies();
  const res = await client.user.$get(
    {},
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  );

  if (!res.ok) {
    const error = await res.json();
    console.error(res.status, error.message);
    throw new Error("ユーザー情報の取得に失敗しました");
  }

  return res.json();
}
