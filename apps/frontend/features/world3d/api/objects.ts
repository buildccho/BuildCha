import { cookies } from "next/headers";
import { client } from "@/lib/rpc-client";

/**
 * 特定のオブジェクトをIDで取得
 * Server Componentから使用
 */
export async function fetchObjectById(id: string) {
  const res = await client.objects[":id"].$get(
    { param: { id } },
    {
      headers: {
        Cookie: (await cookies()).toString(),
      },
    },
  );

  if (!res.ok) {
    const error = await res.json();
    console.error(res.status, error.message);
    throw new Error("Failed to fetch object");
  }

  return res.json();
}
