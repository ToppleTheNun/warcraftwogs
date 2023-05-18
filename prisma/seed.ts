import { prisma } from "~/db";
import { loadLeaderboardEntriesForReport } from "~/load.server";
import { isRegion } from "~/utils";

const seed = async () => {
  const entries = await loadLeaderboardEntriesForReport("qw9QL7RPAKNC3jx2", {});

  const seededEntries = await entries.reduce(async (accP, entry) => {
    const acc = await accP;
    await prisma.wordOfGlory.create({
      data: {
        report: entry.report,
        fight: entry.fight,
        heal: entry.heal,
        overheal: entry.overheal,
        totalHeal: entry.totalHeal,
        character: {
          connectOrCreate: {
            where: {
              id: entry.character,
            },
            create: {
              id: entry.character,
              name: entry.name,
              server: entry.realm,
              region: isRegion(entry.region) ? entry.region : "us",
            },
          },
        },
      },
    });
    return acc + 1;
  }, Promise.resolve(0));
  console.log(`Created ${seededEntries} leaderboard entries.`);
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
