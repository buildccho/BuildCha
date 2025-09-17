export type BuildingPartData = {
  id?: string;
  chat?: string;
  name?: string;
  parts: {
    type: string;
    position: number[];
    rotation: number[];
    size: number[];
    color: string;
  }[];
  position?: [number, number, number];
};
