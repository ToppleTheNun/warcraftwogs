import sortBy from "lodash/sortBy";

import { DIFFERENT_REPORT_TOLERANCE } from "~/ingest/constants";
import type {
  IngestedReportFight,
  IngestibleReportFight,
  Report,
  ReportFight,
  ReportWithIngestedFights,
  ReportWithIngestibleFights,
} from "~/ingest/types";
import { prisma } from "~/lib/db.server";
import type { Timings } from "~/lib/timing.server";
import { time } from "~/lib/timing.server";
import { isPresent } from "~/typeGuards";
import { isRegion } from "~/utils";
import { getFights, getPlayerDetails } from "~/wcl/queries";
import type { PlayerDetail } from "~/wcl/schemas";
import { playerDetailsDpsHealerTankSchema } from "~/wcl/schemas";

const getBasicReport = async (
  reportID: string,
  timings: Timings
): Promise<Report | null> => {
  const rawFightData = await time(() => getFights({ reportID }), {
    type: "getFights",
    timings,
  });
  if (!rawFightData.reportData || !rawFightData.reportData.report) {
    return null;
  }

  const fights = rawFightData.reportData.report.fights;
  const reportRegion =
    rawFightData.reportData.report.region?.slug?.toLowerCase();
  const reportStartTime = rawFightData.reportData.report.startTime;
  const reportEndTime = rawFightData.reportData.report.startTime;
  const title = rawFightData.reportData.report.title;
  if (!reportRegion || !isRegion(reportRegion) || !isPresent(fights)) {
    return null;
  }

  const reportFights = fights
    .filter(isPresent)
    // filter out fights where there is no difficulty
    .filter((fight) => fight.difficulty)
    .map<ReportFight>((fight) => ({
      report: reportID,
      fightID: fight.id,
      startTime: reportStartTime + fight.startTime,
      endTime: reportStartTime + fight.endTime,
      encounterID: fight.encounterID,
      difficulty: fight.difficulty ?? 0,
      region: reportRegion,
      friendlyPlayerIds: isPresent(fight.friendlyPlayers)
        ? fight.friendlyPlayers.filter(isPresent)
        : [],
    }));

  return {
    reportID,
    title,
    region: reportRegion,
    startTime: reportStartTime,
    endTime: reportEndTime,
    reportFights: reportFights,
  };
};

const enhanceBasicFight = (
  basicReportFight: ReportFight,
  playerDetails: PlayerDetail[]
): IngestibleReportFight => {
  const friendlyPlayerDetails = basicReportFight.friendlyPlayerIds
    .map<PlayerDetail | undefined>((playerId) =>
      playerDetails.find((player) => player.id === playerId)
    )
    .filter(isPresent);
  const friendlyPlayers = sortBy(
    friendlyPlayerDetails.map((player) => player.guid)
  ).join(":");

  return {
    ...basicReportFight,
    friendlyPlayerDetails,
    friendlyPlayers,
  };
};

const enhanceReport = async (
  basicReport: Report,
  timings: Timings
): Promise<ReportWithIngestibleFights | null> => {
  const fightIDs = basicReport.reportFights.map((fight) => fight.fightID);

  const rawPlayerDetails = await time(
    () =>
      getPlayerDetails({
        reportID: basicReport.reportID,
        fightIDs,
      }),
    { type: "getPlayerDetails", timings }
  );

  const playerDetailsResult = playerDetailsDpsHealerTankSchema.safeParse(
    rawPlayerDetails.reportData?.report?.playerDetails?.data?.playerDetails
  );
  if (!playerDetailsResult.success) {
    return null;
  }

  const playerDetails = [
    ...playerDetailsResult.data.dps,
    ...playerDetailsResult.data.healers,
    ...playerDetailsResult.data.tanks,
  ];
  const reportFightsWithDetails =
    basicReport.reportFights.map<IngestibleReportFight>((fight) =>
      enhanceBasicFight(fight, playerDetails)
    );

  return { ...basicReport, ingestibleFights: reportFightsWithDetails };
};

export const filterReportFightsToOnlyThoseWithPaladins = (
  enhancedReport: ReportWithIngestibleFights
): ReportWithIngestibleFights => ({
  ...enhancedReport,
  ingestibleFights: enhancedReport.ingestibleFights.filter((fight) =>
    fight.friendlyPlayerDetails.some(
      (player) => player.type.toLowerCase() === "paladin"
    )
  ),
});

export const ingestFight = async (
  reportFight: IngestibleReportFight,
  timings: Timings
): Promise<IngestedReportFight> => {
  const existingFight = await time(
    () =>
      prisma.fight.findFirst({
        where: {
          startTime: {
            gte: new Date(reportFight.startTime - DIFFERENT_REPORT_TOLERANCE),
            lte: new Date(reportFight.startTime + DIFFERENT_REPORT_TOLERANCE),
          },
          endTime: {
            gte: new Date(reportFight.endTime - DIFFERENT_REPORT_TOLERANCE),
            lte: new Date(reportFight.endTime + DIFFERENT_REPORT_TOLERANCE),
          },
          encounterId: reportFight.encounterID,
          difficulty: reportFight.difficulty,
          friendlyPlayers: reportFight.friendlyPlayers,
          region: reportFight.region,
        },
      }),
    { type: "prisma.fight.findFirst", timings }
  );
  if (existingFight) {
    return { ...reportFight, fight: existingFight };
  }

  const createdFight = await time(
    () =>
      prisma.fight.create({
        data: {
          firstSeenReport: reportFight.report,
          startTime: new Date(reportFight.startTime),
          endTime: new Date(reportFight.endTime),
          difficulty: reportFight.difficulty,
          encounterId: reportFight.encounterID,
          friendlyPlayers: reportFight.friendlyPlayers,
          region: reportFight.region,
        },
      }),
    { type: "prisma.fight.create", timings }
  );

  return { ...reportFight, fight: createdFight };
};

export const ingestFights = (
  reportFights: IngestibleReportFight[],
  timings: Timings
): Promise<IngestedReportFight[]> =>
  Promise.all(reportFights.map((fight) => ingestFight(fight, timings)));

export const ingestFightsFromReport = async (
  reportID: string,
  timings: Timings
): Promise<ReportWithIngestedFights | null> => {
  const basicReport = await getBasicReport(reportID, timings);
  if (!basicReport) {
    return null;
  }

  const enhancedReport = await enhanceReport(basicReport, timings);
  if (!enhancedReport) {
    return null;
  }

  const filteredEnhancedReport =
    filterReportFightsToOnlyThoseWithPaladins(enhancedReport);

  const ingestedFights = await ingestFights(
    filteredEnhancedReport.ingestibleFights,
    timings
  );

  return { ...enhancedReport, ingestedFights };
};
