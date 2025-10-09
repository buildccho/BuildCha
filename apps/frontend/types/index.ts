export type Parts = {
  id?: string;
  type: string;
  position: number[];
  rotation: number[];
  size: number[];
  color: string;
  role?: "Answer" | "User";
  createdAt?: string;
  userObjectId?: string | null;
};

export type BuildingPartData = {
  id?: string;
  chat?: string;
  name?: string;
  parts: Parts[];
  position?: [number, number, number];
  rotation?: [number, number, number];
  boundingBox?: [number, number, number];
  objectPrecision?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  level?: number;
  score?: number;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean | null;
  userObjectCount?: number;
};
