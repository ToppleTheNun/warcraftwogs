import { prisma } from "~/db";
import { loadLeaderboardEntriesForReport } from "~/load.server";
import { createWordOfGlory } from "~/models/wordOfGlory.server";

const seed = async () => {
  const { entries } = await loadLeaderboardEntriesForReport(
    "qw9QL7RPAKNC3jx2",
    {}
  );

  const seededEntries = await entries.reduce(async (accP, entry) => {
    const acc = await accP;
    await createWordOfGlory(entry, {});
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
