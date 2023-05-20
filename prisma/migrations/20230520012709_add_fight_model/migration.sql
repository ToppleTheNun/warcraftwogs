/*
  Warnings:

  - You are about to drop the column `fight` on the `WordOfGlory` table. All the data in the column will be lost.
  - Added the required column `fightId` to the `WordOfGlory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `WordOfGlory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WordOfGlory" DROP COLUMN "fight",
ADD COLUMN     "fightId" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Fight" (
    "id" TEXT NOT NULL,
    "firstSeenReport" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "encounterId" INTEGER NOT NULL,
    "friendlyPlayers" TEXT NOT NULL,
    "region" "Regions" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fight_startTime_endTime_encounterId_friendlyPlayers_region_key" ON "Fight"("startTime", "endTime", "encounterId", "friendlyPlayers", "region");

-- AddForeignKey
ALTER TABLE "WordOfGlory" ADD CONSTRAINT "WordOfGlory_fightId_fkey" FOREIGN KEY ("fightId") REFERENCES "Fight"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
