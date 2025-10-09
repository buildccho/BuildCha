"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { client } from "@/lib/rpc-client";

type CreateMapResult =
  | { success: true; data: { id: string; name: string } }
  | { success: false; error: string };

/**
 * 新しいマップを作成するServer Action
 * Client Componentから呼び出し可能
 */
export async function createMapAction(name: string): Promise<CreateMapResult> {
  try {
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
      return {
        success: false,
        error: error.message || "マップの作成に失敗しました",
      };
    }

    const data = await res.json();
    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Failed to create map:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "マップの作成に失敗しました",
    };
  }
}
