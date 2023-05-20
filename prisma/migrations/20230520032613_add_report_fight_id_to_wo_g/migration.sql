/*
  Warnings:

  - Added the required column `reportFightId` to the `WordOfGlory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WordOfGlory" ADD COLUMN     "reportFightId" INTEGER NOT NULL;
