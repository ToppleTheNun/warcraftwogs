import type { Prisma } from "@prisma/client";
import { Regions } from "@prisma/client";
import addMinutes from "date-fns/addMinutes";

import { regions } from "~/cookies";
import { prisma } from "~/db";
import type { Season } from "~/seasons";
import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";
import { isPresent } from "~/typeGuards";
import { orderedRegionsBySize } from "~/utils";
import {
  getInitialReportData,
  getPlayerDetails,
  getWordOfGloryHealing,
} from "~/wcl/queries";

export const searchParamSeparator = "~";

export type WordOfGloryLeaderboardEntry = {
  name: string;
  realm: string;
  region: string;
  heal: number;
  overheal: number;
  totalHeal: number;
  report: string;
  fight: number;
  timestamp: number;
  character: number;
};

export const loadLeaderboardEntriesForReport = async (
  reportID: string,
  timings: Timings
): Promise<WordOfGloryLeaderboardEntry[]> => {
  const rawFightData = await time(() => getInitialReportData({ reportID }), {
    type: "getInitialReportData",
    timings,
  });
  const fights = rawFightData.reportData?.report?.fights;
  const reportRegion = rawFightData.reportData?.report?.region?.slug;
  const startTime = rawFightData.reportData?.report?.startTime;
  if (!startTime || !reportRegion || !fights) {
    return [];
  }

  const fightIds = fights.filter(isPresent).map<number>((fight) => fight.id);
  if (fightIds.length === 0) {
    return [];
  }

  const rawWordOfGloryHealingEvents = await time(
    () =>
      getWordOfGloryHealing({
        reportID: "qw9QL7RPAKNC3jx2",
        fightIDs: fightIds,
      }),
    {
      type: "getWordOfGloryHealing",
      timings,
    }
  );
  const wordOfGloryHealingEvents =
    rawWordOfGloryHealingEvents.reportData?.report?.events?.data;
  if (
    !wordOfGloryHealingEvents ||
    !Array.isArray(wordOfGloryHealingEvents) ||
    wordOfGloryHealingEvents.length === 0
  ) {
    return [];
  }
  const sourceIdsForCasts = wordOfGloryHealingEvents.map<number>(
    (event) => event.sourceID
  );

  const rawPlayerDetails = await time(
    () =>
      getPlayerDetails({ reportID: "qw9QL7RPAKNC3jx2", fightIDs: fightIds }),
    {
      type: "getPlayerDetails",
      timings,
    }
  );
  const playerDetails =
    rawPlayerDetails.reportData?.report?.playerDetails?.data?.playerDetails;
  if (!playerDetails) {
    return [];
  }
  const players = [
    ...playerDetails.dps,
    ...playerDetails.healers,
    ...playerDetails.tanks,
  ].filter((player) => sourceIdsForCasts.includes(player.id));

  return wordOfGloryHealingEvents
    .map<WordOfGloryLeaderboardEntry | null>((event) => {
      const player = players.find((player) => player.id === event.sourceID);
      if (!player) {
        return null;
      }
      const heal = event.amount;
      const overheal = event.overheal ?? 0;
      const totalHeal = heal + overheal;
      const timestamp = startTime + (event.timestamp ?? 0);
      const region = reportRegion.toLowerCase();

      return {
        name: player.name,
        realm: player.server,
        region,
        report: reportID,
        fight: event.fight,
        heal,
        overheal,
        totalHeal,
        timestamp,
        character: player.guid,
      };
    })
    .filter(isPresent);
};

export const loadDataForRegion = async (
  region: Regions,
  season: Season,
  timings: Timings,
  clockOffsetMinutes: number
): Promise<WordOfGloryLeaderboardEntry[]> => {
  const dateTimeFilter: Prisma.DateTimeFilter = {};
  const seasonStart = season.startDates[region];
  const seasonEnd = season.endDates[region];

  if (!seasonStart && !seasonEnd) {
    return [];
  }
  if (seasonStart) {
    dateTimeFilter.gte = new Date(seasonStart);
  }
  if (seasonEnd) {
    dateTimeFilter.lte = new Date(seasonEnd);
  }

  const leaderboardEntries = await time(
    () =>
      prisma.wordOfGlory.findMany({
        where: {
          character: {
            region,
          },
          createdAt: dateTimeFilter,
        },
        include: {
          character: true,
        },
        orderBy: {
          totalHeal: "desc",
        },
        take: 10,
      }),
    { type: "prisma.wordOfGlory.findMany", timings }
  );

  return leaderboardEntries.map<WordOfGloryLeaderboardEntry>((entry) => {
    const timestamp = addMinutes(entry.createdAt, clockOffsetMinutes);
    return {
      name: entry.character.name,
      realm: entry.character.server,
      region: entry.character.region,
      heal: entry.heal,
      overheal: entry.overheal,
      totalHeal: entry.totalHeal,
      report: entry.report,
      fight: entry.fight,
      timestamp: timestamp.getTime(),
      character: entry.character.wclGuid,
    };
  });
};

export const determineRegionsToDisplayFromSearchParams = (
  request: Request
): Regions[] | null => {
  const possiblyRegions = new URL(request.url).searchParams.get("regions");

  if (!possiblyRegions) {
    return null;
  }

  const maybeRegions = possiblyRegions
    .split(searchParamSeparator)
    .filter((maybeRegion): maybeRegion is Regions => maybeRegion in Regions);

  if (maybeRegions.length === 0) {
    return null;
  }

  return maybeRegions;
};

export const determineRegionsToDisplayFromCookies = async (
  request: Request
): Promise<Regions[] | null> => {
  const cookie = request.headers.get("Cookie") ?? request.headers.get("cookie");

  if (!cookie) {
    return null;
  }

  const raw = await regions.parse(cookie);
  if (!raw || typeof raw !== "string") {
    return null;
  }

  try {
    const values = raw.split(searchParamSeparator);
    const filteredRegions = orderedRegionsBySize.filter((region) =>
      values.includes(region)
    );
    return filteredRegions.length > 0 ? filteredRegions : null;
  } catch {
    return null;
  }
};

export const setRegionsCookie = (pRegions: string, maxAge: number) =>
  regions.serialize(pRegions, { maxAge });
