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
  rotation?: [number, number, number];
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  level?: number;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
  isAnonymous: boolean | null;
  userObjectCount?: number;
};

export type Quest = {
  id: string;
  name: string;
  imageUrl: string;
  difficulty: "Easy" | "Medium" | "Hard";
  score: number;
  level: number;
};
