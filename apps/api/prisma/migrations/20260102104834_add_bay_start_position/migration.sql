/*
  Warnings:

  - Added the required column `startPosition` to the `Bay` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "startPosition" INTEGER NOT NULL,
    "aisleId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bay_aisleId_fkey" FOREIGN KEY ("aisleId") REFERENCES "Aisle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Bay" ("aisleId", "createdAt", "id", "number", "updatedAt", "width") SELECT "aisleId", "createdAt", "id", "number", "updatedAt", "width" FROM "Bay";
DROP TABLE "Bay";
ALTER TABLE "new_Bay" RENAME TO "Bay";
CREATE UNIQUE INDEX "Bay_aisleId_number_key" ON "Bay"("aisleId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
