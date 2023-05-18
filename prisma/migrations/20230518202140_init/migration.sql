-- CreateEnum
CREATE TYPE "Regions" AS ENUM ('eu', 'kr', 'tw', 'us');

-- CreateTable
CREATE TABLE "WordOfGlory" (
    "id" TEXT NOT NULL,
    "report" TEXT NOT NULL,
    "fight" INTEGER NOT NULL,
    "heal" INTEGER NOT NULL,
    "overheal" INTEGER NOT NULL,
    "totalHeal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "characterId" INTEGER NOT NULL,

    CONSTRAINT "WordOfGlory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "region" "Regions" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordOfGlory" ADD CONSTRAINT "WordOfGlory_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
