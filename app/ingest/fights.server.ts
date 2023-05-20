import type { Fight, Regions } from "@prisma/client";
import sortBy from "lodash/sortBy";

import { prisma } from "~/db";
import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";
import { isPresent } from "~/typeGuards";
import { isRegion } from "~/utils";
import { getFights, getFightsById, getPlayerDetails } from "~/wcl/queries";
import type { PlayerDetail } from "~/wcl/schemas";
import { playerDetailsDpsHealerTankSchema } from "~/wcl/schemas";

export type BasicReportFight = {
  report: string;
  fightID: number;
  startTime: number;
  endTime: number;
  encounterID: number;
  difficulty: number;
  region: Regions;
  friendlyPlayerIds: number[];
};

export type EnhancedReportFight = BasicReportFight & {
  friendlyPlayerDetails: PlayerDetail[];
  friendlyPlayers: string;
};

export const getReportFights = async (
  reportID: string,
  fightID: number,
  timings: Timings
): Promise<BasicReportFight[]> => {
  const rawFightData = await time(
    () => getFightsById({ reportID, fightIDs: [fightID] }),
    {
      type: "getFights",
      timings,
    }
  );
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

  return (
    fights
      .filter(isPresent)
      // filter out fights where there is no difficulty
      .filter((fight) => fight.difficulty)
      .map<BasicReportFight>((fight) => ({
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
      }))
  );
};

export const enhanceReportFightsWithPlayerDetails = async (
  reportID: string,
  timings: Timings,
  reportFights: BasicReportFight[]
): Promise<EnhancedReportFight[]> => {
  const fightIDs = reportFights.map((fight) => fight.fightID);

  const rawPlayerDetails = await getPlayerDetails({
    reportID,
    fightIDs,
  });
  const playerDetailsResult = playerDetailsDpsHealerTankSchema.safeParse(
    rawPlayerDetails.reportData?.report?.playerDetails?.data?.playerDetails
  );
  if (!playerDetailsResult.success) {
    console.error(
      "!playerDetailsResult.success",
      playerDetailsResult.error.errors
    );
    return reportFights.map<EnhancedReportFight>((fight) => ({
      ...fight,
      friendlyPlayerDetails: [],
      friendlyPlayers: "",
    }));
  }

  const playerDetails = [
    ...playerDetailsResult.data.dps,
    ...playerDetailsResult.data.healers,
    ...playerDetailsResult.data.tanks,
  ];
  return reportFights.map<EnhancedReportFight>((fight) => {
    const friendlyPlayerDetails = fight.friendlyPlayerIds
      .map<PlayerDetail | undefined>((playerId) =>
        playerDetails.find((player) => player.id === playerId)
      )
      .filter(isPresent);
    const friendlyPlayers = sortBy(
      friendlyPlayerDetails.map((player) => player.guid)
    ).join(":");

    return {
      ...fight,
      friendlyPlayerDetails,
      friendlyPlayers,
    };
  });
};

export const filterReportFightsToOnlyThoseWithPaladins = (
  reportFights: EnhancedReportFight[]
): EnhancedReportFight[] => {
  return reportFights.filter((fight) =>
    fight.friendlyPlayerDetails.some(
      (player) => player.type.toLowerCase() === "paladin"
    )
  );
};

export type FightTuple = [EnhancedReportFight, Fight];
const startTimeTolerance = 2000;
const endTimeTolerance = 2000;
export const findOrCreateFight = async (
  reportFight: EnhancedReportFight,
  timings: Timings
): Promise<FightTuple> => {
  const existingFight = await time(
    () =>
      prisma.fight.findFirst({
        where: {
          startTime: {
            gte: new Date(reportFight.startTime - startTimeTolerance),
            lte: new Date(reportFight.startTime + startTimeTolerance),
          },
          endTime: {
            gte: new Date(reportFight.endTime - endTimeTolerance),
            lte: new Date(reportFight.endTime + endTimeTolerance),
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
    return [reportFight, existingFight];
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

  return [reportFight, createdFight];
};

export const findOrCreateFights = (
  reportFights: EnhancedReportFight[],
  timings: Timings
): Promise<FightTuple[]> =>
  Promise.all(reportFights.map((fight) => findOrCreateFight(fight, timings)));

export const ingestFightsFromReport = async (
  reportID: string,
  fightID: number,
  timings: Timings
): Promise<FightTuple[]> => {
  const reportFights = await getReportFights(reportID, fightID, timings);
  const enhancedReportFights = await enhanceReportFightsWithPlayerDetails(
    reportID,
    timings,
    reportFights
  );
  const filteredReportFights =
    filterReportFightsToOnlyThoseWithPaladins(enhancedReportFights);
  return findOrCreateFights(filteredReportFights, timings);
};
