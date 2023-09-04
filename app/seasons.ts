import { type Regions } from "@prisma/client";

import type { WordOfGloryLeaderboardEntry } from "~/load.server";

const UNKNOWN_SEASON_START_OR_ENDING = null;

export type Season = {
  name: string;
  slug: string;
  startDates: Record<Regions, number | null>;
  endDates: Record<Regions, number | null>;
  seasonIcon: string;
  encounterIds: ReadonlyArray<number>;
};

export type EnhancedSeason = Season & {
  dataByRegion: Record<Regions, WordOfGloryLeaderboardEntry[]>;
  regionsToDisplay: Regions[];
};

export const seasons: readonly Season[] = [
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
    encounterIds: [
      2687, // Amalgamation Chamber
      2682, // Assault of the Zaqali
      2684, // Echo of Neltharion
      2693, // Forgotten Experiments
      2688, // Kazzara
      2683, // Magmorax
      2680, // Rashok, the Elder
      2685, // Sarkareth
      2689, // The Vigilant Steward, Zskarn
      12520, // Brackenhide Hollow
      61754, // Freehold
      12527, // Halls of Infusion
      61458, // Neltharion's Lair
      12519, // Neltharus
      12451, // Uldaman: Legacy of Tyr
      61841, // The Underrot
      10657, // The Vortex Pinnacle
    ],
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
    encounterIds: [
      2614, // Broodkeeper Diurna
      2635, // Dathea, Ascended
      2587, // Eranog
      2605, // Kurog Grimtotem
      2590, // Primal Council
      2607, // Raszageth the Storm-Eater
      2592, // Sennarth, the Cold Breath
      2639, // Terros
      12526, // Algeth'ar Academy
      12515, // The Azure Vault
      61571, // Court of Stars
      61477, // Halls of Valor
      12516, // The Nokhud Offensive
      12521, // Ruby Life Pools
      61176, // Shadowmoon Burial Grounds
      10960, // Temple of the Jade Serpent
    ],
  },
] as const;

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
