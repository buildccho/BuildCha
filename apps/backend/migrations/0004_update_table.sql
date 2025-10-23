-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "challenge" TEXT,
    "score" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL
);
INSERT INTO "new_quests" ("challenge", "createdAt", "difficulty", "id", "level", "name", "score") SELECT "challenge", "createdAt", "difficulty", "id", "level", "name", "score" FROM "quests";
DROP TABLE "quests";
ALTER TABLE "new_quests" RENAME TO "quests";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
