/*
  Warnings:

  - You are about to drop the column `characterId` on the `WordOfGlory` table. All the data in the column will be lost.
  - Added the required column `sourceId` to the `WordOfGlory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetId` to the `WordOfGlory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WordOfGlory" DROP CONSTRAINT "WordOfGlory_characterId_fkey";

-- AlterTable
ALTER TABLE "WordOfGlory" DROP COLUMN "characterId",
ADD COLUMN     "sourceId" INTEGER NOT NULL,
ADD COLUMN     "targetId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "WordOfGlory" ADD CONSTRAINT "WordOfGlory_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
