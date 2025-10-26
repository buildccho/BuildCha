import { create } from "zustand";
import type { BuildingPartData } from "@/types";

export type History = {
  role: "user" | "assistant";
  content: string;
};

type ObjectStore = {
  objectData: { BuildingPartData: BuildingPartData } | null;
  name: string | null;
  chatHistory: History[];
  objectPrecision: number;
  setObjectData: (
    data: {
      BuildingPartData: BuildingPartData;
    } | null,
  ) => void;
  setName: (name: string) => void;
  setChatHistory: (history: History[]) => void;
  setObjectPrecision: (precision: number) => void;
  reset: () => void;
};

export const useObjectStore = create<ObjectStore>((set) => ({
  objectData: null,
  name: null,
  chatHistory: [],
  objectPrecision: 0,
  setObjectData: (data) => set({ objectData: data }),
  setName: (name) => set({ name }),
  setChatHistory: (history) => set({ chatHistory: history }),
  setObjectPrecision: (precision) => set({ objectPrecision: precision }),
  reset: () =>
    set({
      objectData: null,
      name: null,
      chatHistory: [],
      objectPrecision: 0,
    }),
}));
