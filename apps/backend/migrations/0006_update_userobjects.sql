-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_objects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "position" TEXT,
    "rotation" TEXT,
    "boundingBox" TEXT NOT NULL,
    "objectPrecision" REAL,
    CONSTRAINT "user_objects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_objects_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_objects_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_objects" ("boundingBox", "createdAt", "id", "mapId", "name", "objectPrecision", "position", "questId", "rotation", "userId") SELECT "boundingBox", "createdAt", "id", "mapId", "name", "objectPrecision", "position", "questId", "rotation", "userId" FROM "user_objects";
DROP TABLE "user_objects";
ALTER TABLE "new_user_objects" RENAME TO "user_objects";
CREATE INDEX "user_objects_userId_idx" ON "user_objects"("userId");
CREATE INDEX "user_objects_mapId_idx" ON "user_objects"("mapId");
CREATE INDEX "user_objects_questId_idx" ON "user_objects"("questId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
