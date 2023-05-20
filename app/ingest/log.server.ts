import type { Timings } from "~/timing.server";

import { ingestFightsFromReport } from "./fights.server";

export const ingestWarcraftLogsReport = async (reportCode: string, timings: Timings) => {
  const fights = await ingestFightsFromReport(reportCode, timings);

};
