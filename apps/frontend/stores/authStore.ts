import { create } from "zustand";
import { authClient } from "@/lib/auth-client";
import { client } from "@/lib/rpc-client";
import type { User } from "@/types";

type AuthStore = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ loading }),

  signIn: async () => {
    try {
      set({ loading: true });
      const result = await authClient.signIn.anonymous();
      if (result.data?.user) {
        const fixedUser = {
          ...result.data.user,
          image: null,
          isAnonymous: null,
          createdAt: new Date(result.data.user.createdAt),
          updatedAt: new Date(result.data.user.updatedAt),
        };
        set({ user: fixedUser, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });
      await authClient.signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      set({ loading: false });
    }
  },

  checkSession: async () => {
    try {
      set({ loading: true });
      const res = await client.user.$get();
      if (res.status !== 200) {
        set({ user: null, isAuthenticated: false });
        return;
      }

      const user = await res.json();
      if (user) {
        const fixedUser = {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        };
        set({ user: fixedUser, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Session check failed:", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ loading: false });
    }
  },
}));
