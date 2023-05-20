import type { Regions } from "@prisma/client";

import { isPresent } from "~/typeGuards";
import { isRegion } from "~/utils";
import { getFights, getFightsById, getPlayerDetails } from "~/wcl/queries";
import { prisma } from "~/db";
import { ingestFightsFromReport } from "~/ingest/fights.server";

export type ReportFight = {
  startTime: number;
  endTime: number;
  encounterID: number;
  region: Regions;
  friendlyPlayers: string;
};

export const getReportData = async (
  reportID: string,
  fightID: number
): Promise<ReportFight[]> => {
  const rawFightData = await getFights({ reportID });
  const fights = rawFightData.reportData?.report?.fights;
  const reportRegion =
    rawFightData.reportData?.report?.region?.slug?.toLowerCase();
  const reportStartTime = rawFightData.reportData?.report?.startTime;
  if (
    !reportStartTime ||
    !reportRegion ||
    !isRegion(reportRegion) ||
    !isPresent(fights)
  ) {
    return [];
  }

  const rawPlayerDetails = await getPlayerDetails({
    reportID,
    fightIDs: [fightID],
  });
  const playerDetails =
    rawPlayerDetails.reportData?.report?.playerDetails?.data?.playerDetails;
  if (!playerDetails) {
    return [];
  }
  const players = [
    ...playerDetails.dps,
    ...playerDetails.healers,
    ...playerDetails.tanks,
  ];

  return fights.filter(isPresent).map<ReportFight>((fight) => {
    const friendlyPlayerGuids: number[] = isPresent(fight.friendlyPlayers)
      ? fight.friendlyPlayers
          .map((friendlyPlayer) =>
            players.find((player) => player.id === friendlyPlayer)
          )
          .filter(isPresent)
          .map((player) => player.guid)
      : [];
    friendlyPlayerGuids.sort((a, b) => a - b);

    console.log(
      `reportStartTime (${reportStartTime}) + fight.startTime (${fight.startTime})`
    );
    return {
      encounterID: fight.encounterID,
      startTime: reportStartTime + fight.startTime,
      endTime: reportStartTime + fight.endTime,
      region: reportRegion,
      friendlyPlayers: friendlyPlayerGuids.join(":"),
    };
  });
};

const isSameFight = (fightA: ReportFight, fightB: ReportFight) => {
  const startTimeDifference = Math.abs(fightB.startTime - fightA.startTime);
  const endTimeDifference = Math.abs(fightB.endTime - fightA.endTime);

  const startTimeTolerance = 2000;
  const endTimeTolerance = 2000;
  const isStartTimeWithinTolerance = startTimeDifference <= startTimeTolerance;
  const isEndTimeWithinTolerance = endTimeDifference <= endTimeTolerance;
  const isSamePlayers = fightB.friendlyPlayers === fightA.friendlyPlayers;
  const isSameEncounterID = fightB.encounterID === fightA.encounterID;

  return (
    isStartTimeWithinTolerance &&
    isEndTimeWithinTolerance &&
    isSamePlayers &&
    isSameEncounterID
  );
};

(async () => {
  const numberOfFightsBeforeIngestReportA = await prisma.fight.count();
  console.log(`Number of fights before ingesting report A: ${numberOfFightsBeforeIngestReportA}`);
  await ingestFightsFromReport("xmXLtb6M2c4jBYqZ", 18, {});
  const numberOfFightsAfterIngestReportA = await prisma.fight.count();
  console.log(`Number of fights after ingesting report A: ${numberOfFightsAfterIngestReportA}`);

  const numberOfFightsBeforeIngestReportB = await prisma.fight.count();
  console.log(`Number of fights before ingesting report B: ${numberOfFightsBeforeIngestReportB}`);
  await ingestFightsFromReport("AWTqRm8xNJzPDBya", 1, {});
  const numberOfFightsAfterIngestReportB = await prisma.fight.count();
  console.log(`Number of fights after ingesting report B: ${numberOfFightsAfterIngestReportB}`);
})();
