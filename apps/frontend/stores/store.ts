import { create } from "zustand";
import type { BuildingPartData } from "@/types";

type ObjectStore = {
  objectData: { BuildingPartData: BuildingPartData } | null;
  setObjectData: (
    data: {
      BuildingPartData: BuildingPartData;
    } | null,
  ) => void;
};

export const useObjectStore = create<ObjectStore>((set) => ({
  objectData: null,
  setObjectData: (data) => set({ objectData: data }),
}));
