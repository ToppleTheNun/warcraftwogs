import type { Prisma } from "@prisma/client";
import { Regions } from "@prisma/client";

import { regions } from "~/cookies";
import { prisma } from "~/db";
import type { Season } from "~/seasons";
import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";
import { orderedRegionsBySize } from "~/utils";

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

export const loadDataForRegion = async (
  region: Regions,
  season: Season,
  timings: Timings
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
          fight: {
            region,
          },
          createdAt: dateTimeFilter,
        },
        include: {
          source: true,
          fight: true,
        },
        orderBy: {
          totalHeal: "desc",
        },
        take: 10,
      }),
    { type: "prisma.wordOfGlory.findMany", timings }
  );

  return leaderboardEntries.map<WordOfGloryLeaderboardEntry>((entry) => ({
    name: entry.source.name,
    realm: entry.source.server,
    region: entry.source.region,
    heal: entry.heal,
    overheal: entry.overheal,
    totalHeal: entry.totalHeal,
    report: entry.report,
    fight: entry.reportFightId,
    timestamp: entry.timestamp.getTime(),
    character: entry.source.id,
  }));
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
