"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { client } from "@/lib/rpc-client";
import type { User } from "@/types";

type UpdateUserResult =
  | { success: true; data: User }
  | { success: false; error: string };

/**
 * ユーザー情報を更新するServer Action
 * Client Componentから呼び出し可能
 */
export async function updateUserAction(user: {
  name?: string;
  image?: string;
}): Promise<UpdateUserResult> {
  try {
    const cookieStore = await cookies();
    const response = await client.user.$patch(
      { json: user },
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(response.status, error.message);
      return {
        success: false,
        error: error.message || "ユーザー情報の更新に失敗しました",
      };
    }

    const updatedUser = await response.json();
    revalidatePath("/");
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Failed to update user:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "ユーザー情報の更新に失敗しました",
    };
  }
}
