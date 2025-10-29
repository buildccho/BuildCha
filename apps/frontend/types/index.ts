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
  boundingBox?: [number, number, number];
};

export type UserObject = {
  id: string;
  name: string;
  parts: {
    position: [number, number, number];
    rotation: [number, number, number];
    size: [number, number, number];
    id: string;
    type: string;
    color: string;
    role: string;
    createdAt: string;
    userObjectId: string | null;
  }[];
  position: [number, number, number];
  rotation: [number, number, number];
  boundingBox: [number, number, number];
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

export type AnswerObject = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  type: string;
  color: string;
  role?: string;
  createdAt?: string;
};

export type Quest = {
  id: string;
  name: string;
  difficulty: string;
  score: number;
  level: number;
  challenge: string | null;
  createdAt: Date | string;
  answerObject?: AnswerObject[];
};
