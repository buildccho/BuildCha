-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userObjectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    CONSTRAINT "ChatHistory_userObjectId_fkey" FOREIGN KEY ("userObjectId") REFERENCES "user_objects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatHistory" ("id", "message", "role") SELECT "id", "message", "role" FROM "ChatHistory";
DROP TABLE "ChatHistory";
ALTER TABLE "new_ChatHistory" RENAME TO "ChatHistory";
CREATE INDEX "ChatHistory_userObjectId_idx" ON "ChatHistory"("userObjectId");
CREATE TABLE "new_Parts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "size" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "rotation" TEXT NOT NULL,
    "userObjectId" TEXT,
    "role" TEXT NOT NULL,
    CONSTRAINT "Parts_userObjectId_fkey" FOREIGN KEY ("userObjectId") REFERENCES "user_objects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Parts" ("color", "id", "position", "role", "rotation", "size", "type") SELECT "color", "id", "position", "role", "rotation", "size", "type" FROM "Parts";
DROP TABLE "Parts";
ALTER TABLE "new_Parts" RENAME TO "Parts";
CREATE INDEX "Parts_userObjectId_idx" ON "Parts"("userObjectId");
CREATE TABLE "new_maps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "maps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_maps" ("id", "name") SELECT "id", "name" FROM "maps";
DROP TABLE "maps";
ALTER TABLE "new_maps" RENAME TO "maps";
CREATE INDEX "maps_userId_idx" ON "maps"("userId");
CREATE TABLE "new_quests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "challenge" TEXT,
    "score" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL
);
INSERT INTO "new_quests" ("challenge", "difficulty", "id", "level", "name", "score") SELECT "challenge", "difficulty", "id", "level", "name", "score" FROM "quests";
DROP TABLE "quests";
ALTER TABLE "new_quests" RENAME TO "quests";
CREATE TABLE "new_user_objects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "rotation" TEXT NOT NULL,
    "boundingBox" TEXT NOT NULL,
    "objectPrecision" REAL NOT NULL,
    CONSTRAINT "user_objects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_objects_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_objects_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_objects" ("id", "name", "position", "rotation") SELECT "id", "name", "position", "rotation" FROM "user_objects";
DROP TABLE "user_objects";
ALTER TABLE "new_user_objects" RENAME TO "user_objects";
CREATE INDEX "user_objects_userId_idx" ON "user_objects"("userId");
CREATE INDEX "user_objects_mapId_idx" ON "user_objects"("mapId");
CREATE INDEX "user_objects_questId_idx" ON "user_objects"("questId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
