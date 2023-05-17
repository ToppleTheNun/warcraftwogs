import { uniqBy } from "lodash";

import { prisma } from "~/db";
import { loadLeaderboardEntriesForReport } from "~/load.server";
import { isRegion } from "~/utils";

const seed = async () => {
  const entries = await loadLeaderboardEntriesForReport("qw9QL7RPAKNC3jx2", {});

  // Create characters
  const uniqueEntriesByCharacter = uniqBy(entries, (entry) => entry.character);
  const wclGuids = uniqueEntriesByCharacter.map((entry) => entry.character);
  let existingCharacters = await prisma.character.findMany({
    where: {
      wclGuid: {
        in: wclGuids,
      },
    },
  });
  const charactersToCreate = uniqueEntriesByCharacter.filter(
    (entry) =>
      !existingCharacters.find(
        (existing) => existing.wclGuid === entry.character
      )
  );

  if (charactersToCreate.length > 0) {
    const seededCharacters = await charactersToCreate.reduce(
      async (accP, entry) => {
        const acc = await accP;
        await prisma.character.create({
          data: {
            name: entry.name,
            server: entry.realm,
            region: isRegion(entry.region) ? entry.region : "us",
            wclGuid: entry.character,
          },
        });
        return acc + 1;
      },
      Promise.resolve(0)
    );
    console.log(`Created ${seededCharacters} characters.`);
    existingCharacters = await prisma.character.findMany({
      where: {
        wclGuid: {
          in: wclGuids,
        },
      },
    });
  }

  const seededEntries = await entries.reduce(async (accP, entry) => {
    const acc = await accP;
    const character = existingCharacters.find(
      (char) => char.wclGuid === entry.character
    );
    if (!character) {
      return acc;
    }
    await prisma.wordOfGlory.create({
      data: {
        report: entry.report,
        fight: entry.fight,
        heal: entry.heal,
        overheal: entry.overheal,
        totalHeal: entry.totalHeal,
        characterId: character.id,
      },
    });
    return acc + 1;
  }, Promise.resolve(0));
  console.log(`Created ${seededEntries} leaderboard entries.`);
};

seed()
  .catch((e) => {
    console.error(1);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
