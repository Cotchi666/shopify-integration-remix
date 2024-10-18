/*
  Warnings:

  - Added the required column `userEmail` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "oaId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "accessToken" TEXT,
    "isInstalled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Shop" ("accessToken", "botId", "createdAt", "id", "isInstalled", "oaId", "shopId", "updatedAt") SELECT "accessToken", "botId", "createdAt", "id", "isInstalled", "oaId", "shopId", "updatedAt" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_shopId_key" ON "Shop"("shopId");
CREATE UNIQUE INDEX "Shop_oaId_key" ON "Shop"("oaId");
CREATE UNIQUE INDEX "Shop_botId_key" ON "Shop"("botId");
CREATE UNIQUE INDEX "Shop_userEmail_key" ON "Shop"("userEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
