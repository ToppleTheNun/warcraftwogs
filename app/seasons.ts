import { type Regions } from "@prisma/client";

const UNKNOWN_SEASON_START_OR_ENDING = null;

export type Season = {
  name: string;
  slug: string;
  startDates: Record<Regions, number | null>;
  endDates: Record<Regions, number | null>;
  seasonIcon: string;
};

export const seasons: Season[] = [
  {
    name: "DF S2",
    slug: "df-season-2",
    startDates: {
      us: 1_683_644_400_000,
      eu: 1_683_691_200_000,
      kr: 1_683_759_600_000,
      tw: 1_683_759_600_000,
    },
    endDates: {
      us: UNKNOWN_SEASON_START_OR_ENDING,
      eu: UNKNOWN_SEASON_START_OR_ENDING,
      kr: UNKNOWN_SEASON_START_OR_ENDING,
      tw: UNKNOWN_SEASON_START_OR_ENDING,
    },
    seasonIcon:
      "https://wow.zamimg.com/images/wow/icons/small/inv_misc_head_dragon_black_nightmare.jpg",
  },
  {
    name: "DF S1",
    slug: "df-season-1",
    startDates: {
      us: 1_670_943_600_000,
      eu: 1_670_990_400_000,
      kr: 1_671_058_800_000,
      tw: 1_671_058_800_000,
    },
    endDates: {
      us: 1_683_007_200_000,
      eu: 1_683_057_600_000,
      kr: 1_683_118_800_000,
      tw: 1_683_118_800_000,
    },
    seasonIcon:
      "https://wow.zamimg.com/images/wow/icons/small/shaman_pvp_leaderclan.jpg",
  },
];

export const hasSeasonEndedForAllRegions = (slug: string): boolean => {
  const season = seasons.find((season) => season.slug === slug);

  if (!season) {
    return true;
  }

  const endDates = Object.values(season.endDates);

  if (endDates.includes(UNKNOWN_SEASON_START_OR_ENDING)) {
    return false;
  }

  const now = Date.now();

  return endDates.every((date) => now >= (date ?? 0));
};

export const findSeasonByTimestamp = (
  timestamp = Date.now()
): Season | null => {
  const season = seasons.find(
    (season) =>
      Object.values(season.startDates).some(
        (start) => start && timestamp >= start
      ) &&
      Object.values(season.endDates).some(
        (end) => end === UNKNOWN_SEASON_START_OR_ENDING || end > timestamp
      )
  );

  return season ?? null;
};

export const findSeasonByName = (slug: string): Season | null => {
  if (slug === "latest") {
    const ongoingSeason = findSeasonByTimestamp();

    if (ongoingSeason) {
      return ongoingSeason;
    }

    const mostRecentlyStartedSeason = seasons.find(
      (season) =>
        season.startDates.us !== null && Date.now() >= season.startDates.us
    );

    if (mostRecentlyStartedSeason) {
      return mostRecentlyStartedSeason;
    }
  }

  const match = seasons.find((season) => {
    return season.slug === slug;
  });

  return match ?? null;
};
