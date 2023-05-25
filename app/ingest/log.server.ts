import { ingestWordOfGloryHealsFromReportForFights } from "~/ingest/wogHealingEvents.server";
import type { Timings } from "~/timing.server";

import { ingestFightsFromReport } from "./fights.server";

export const ingestWarcraftLogsReport = async (
  reportCode: string,
  timings: Timings
) => {
  const fights = await ingestFightsFromReport(reportCode, timings);
  if (!fights) {
    throw new Error("No fights returned from WCL API!");
  }
  return await ingestWordOfGloryHealsFromReportForFights(fights, timings);
};
