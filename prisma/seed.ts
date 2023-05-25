import { prisma } from "~/db";
import { ingestFightsFromReport } from "~/ingest/fights.server";
import { ingestWordOfGloryHealsFromReportForFights } from "~/ingest/wogHealingEvents.server";

const seed = async () => {
  const reportID = "AWTqRm8xNJzPDBya";
  const reportWithFights = await ingestFightsFromReport(reportID, {});
  if (!reportWithFights) {
    throw new Error("No fights created!");
  }
  await ingestWordOfGloryHealsFromReportForFights(reportWithFights, {});
};

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
