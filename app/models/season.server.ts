import type { Regions } from "@prisma/client";
import { add } from "date-fns/add";

import type { Timings } from "~/lib/timing.server";
import { loadDataForRegion } from "~/load.server";
import {
  type EnhancedSeason,
  hasSeasonEndedForAllRegions,
  type Season,
} from "~/seasons";
import { isPresent } from "~/typeGuards";
import { orderedRegionsBySize } from "~/utils";

const lastModified = "Last-Modified";
const cacheControl = "Cache-Control";
const eTag = "ETag";
const expires = "Expires";

type GetEnhancedSeasonParams = {
  regions: Regions[] | null;
  season: Season;
  timings: Timings;
};

type GetEnhancedSeasonResult = {
  season: EnhancedSeason;
  headers: Record<string, string>;
};

export const getEnhancedSeason = async ({
  regions: pRegions,
  season,
  timings,
}: GetEnhancedSeasonParams): Promise<GetEnhancedSeasonResult> => {
  const headers: HeadersInit = {};

  if (hasSeasonEndedForAllRegions(season.slug)) {
    const thirtyDays = 30 * 24 * 60 * 60;
    headers[
      cacheControl
    ] = `public, max-age=${thirtyDays}, s-maxage=${thirtyDays}, immutable`;
  }

  const regions = pRegions ?? orderedRegionsBySize;

  const enhancedSeason: EnhancedSeason = {
    ...season,
    regionsToDisplay: regions,
    dataByRegion: {
      eu: [],
      us: [],
      kr: [],
      tw: [],
    },
  };

  await Promise.all(
    Object.values(regions).map(async (region) => {
      enhancedSeason.dataByRegion[region] = await loadDataForRegion(
        region,
        season,
        timings,
      );
    }),
  );

  const mostRecentDataset = Object.values(enhancedSeason.dataByRegion)
    .flat()
    .reduce(
      (acc, leaderboard) =>
        acc > leaderboard.timestamp ? acc : leaderboard.timestamp,
      0,
    );

  headers[lastModified] = new Date(mostRecentDataset).toUTCString();
  headers[expires] = add(new Date(), { minutes: 5 }).toUTCString();
  headers[eTag] = [season.slug, mostRecentDataset, ...regions]
    .filter(isPresent)
    .sort((a, b) => (a > b ? 1 : -1))
    .join("-");

  return { season: enhancedSeason, headers };
};
