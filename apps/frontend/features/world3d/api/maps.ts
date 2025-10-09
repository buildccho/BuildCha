import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { client } from "@/lib/rpc-client";

/**
 * 全てのマップを取得
 * Server Componentから使用
 */
export async function fetchMaps() {
  const res = await client.maps.$get(
    {},
    {
      headers: {
        Cookie: (await cookies()).toString(),
      },
    },
  );

  if (!res.ok) {
    const error = await res.json();
    console.error(res.status, error.message);
    if (res.status === 401) {
      redirect("/start");
    }
    return [];
  }

  return res.json();
}

/**
 * 特定のマップをIDで取得
 * Server Componentから使用
 */
export async function fetchMapById(id: string) {
  const res = await client.maps[":id"].$get(
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
    if (res.status === 401) {
      redirect("/start");
    }
    return null;
  }

  return res.json();
}

/**
 * 新しいマップを作成
 * Server Componentから使用
 */
export async function createMap(name: string) {
  const cookieStore = await cookies();
  const res = await client.maps.$post(
    { json: { name } },
    {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  );

  if (!res.ok) {
    const error = await res.json();
    console.error(res.status, error.message);
    throw new Error(error.message || "マップの作成に失敗しました");
  }

  return res.json();
}
