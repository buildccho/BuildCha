import { z } from "zod";

// Stringの場合はtransformでJSON.parseしてから配列に変換する
export const JsonNumberArray = z.union([
  z
    .string()
    .transform((s) => JSON.parse(s))
    .pipe(z.array(z.number())),
  z.array(z.number()),
]);
export const ChatHistorySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  userObjectId: z.string(),
  role: z.enum(["user", "system"]),
  message: z.string(),
});
export const PartsSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  size: JsonNumberArray,
  type: z.string(),
  color: z.string(),
  position: JsonNumberArray,
  rotation: JsonNumberArray,
  userObjectId: z.string().optional(), //Answer Objectのときはnull
  role: z.enum(["Answer", "User"]),
});

//　以下がメインのスキーマ
export const SessionSchema = z.object({
  id: z.string(),
  expiresAt: z.date(),
  token: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string(),
});

export const ObjectSchema = z.object({
  id: z.string(),
  createAt: z.string(),
  userId: z.string(),
  name: z.string(),
  mapId: z.string(),
  questId: z.string(),
  position: JsonNumberArray.default([0, 0, 0]),
  rotation: JsonNumberArray.default([0, 0, 0]),
  boundingBox: JsonNumberArray.default([0, 0, 0]),
  objectPrecision: z.number().optional(),
  chatHistory: z.array(ChatHistorySchema),
  parts: z.array(PartsSchema),
});

export const MapSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  name: z.string(),
  updateAt: z.string(),
});

export const QuestSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  name: z.string(),
  level: z.number(),
  challenge: z.string().optional(),
  score: z.number(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
});

export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.string().optional(),
  refreshTokenExpiresAt: z.string().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.url(),
  level: z.number(),
  score: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isAnonymous: z.boolean().optional(),
});

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
