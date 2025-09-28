import { z } from "zod";

// Stringの場合はtransformでJSON.parseしてから配列に変換する
const JsonNumberArray = z.union([
  z
    .string()
    .transform((s) => JSON.parse(s))
    .pipe(z.array(z.number())),
  z.array(z.number()),
]);

const ChatHistorySchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  userObjectId: z.string(),
  role: z.enum(["user", "system"]),
  message: z.string(),
});
const PartsSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string(),
});

export const UserObjectSchema = z.object({
  id: z.string(),
  createAt: z.date(),
  userId: z.string(),
  name: z.string(),
  mapId: z.string(),
  questId: z.string(),
  position: JsonNumberArray,
  rotation: JsonNumberArray,
  boundingBox: JsonNumberArray,
  objectPrecision: z.number(),
  chatHistory: z.array(ChatHistorySchema),
  parts: z.array(PartsSchema),
});

export const MapSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  name: z.string(),
  updateAt: z.date(),
  userObjects: z.array(UserObjectSchema),
});

export const QuestSchema = z.object({
  id: z.string(),
  createAt: z.date(),
  name: z.string(),
  image: z.url().optional(),
  level: z.number(),
  challenge: z.string().optional(),
  score: z.number(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  answerObject: z.array(PartsSchema),
  userObject: z.array(UserObjectSchema),
});

export const AccountSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  accessTokenExpiresAt: z.date().optional(),
  refreshTokenExpiresAt: z.date().optional(),
  scope: z.string().optional(),
  password: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  image: z.url(),
  level: z.number(),
  score: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isAnonymous: z.boolean().optional(),
});

export const VerificationSchema = z.object({
  id: z.string(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
