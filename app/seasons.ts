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

function offsetByRegion(timestamp: number, region: Regions): number {
  switch (region) {
    case "us": {
      return timestamp;
    }
    case "eu": {
      return timestamp + 46_800_000;
    }
    case "kr":
    case "tw":
      return timestamp + 111_600_000;
  }
}

export const seasons: readonly Season[] = [
  {
    name: "DF S4",
    slug: "df-season-4",
    startDates: {
      us: offsetByRegion(1_713_884_400_000, "us"),
      eu: offsetByRegion(1_713_884_400_000, "eu"),
      kr: offsetByRegion(1_713_884_400_000, "kr"),
      tw: offsetByRegion(1_713_884_400_000, "tw"),
    },
    endDates: {
      us: UNKNOWN_SEASON_START_OR_ENDING,
      eu: UNKNOWN_SEASON_START_OR_ENDING,
      kr: UNKNOWN_SEASON_START_OR_ENDING,
      tw: UNKNOWN_SEASON_START_OR_ENDING,
    },
    seasonIcon:
      "https://assets.rpglogs.com/img/warcraft/zones/zone-36.png",
    encounterIds: [
      2614, // Broodkeeper Diurna
      2635, // Dathea, Ascended
      2587, // Eranog
      2605, // Kurog Grimtotem
      2590, // Primal Council
      2607, // Raszageth the Storm-Eater
      2592, // Sennarth, the Cold Breath
      2639, // Terros
      2687, // Amalgamation Chamber
      2682, // Assault of the Zaqali
      2684, // Echo of Neltharion
      2693, // Forgotten Experiments
      2688, // Kazzara
      2683, // Magmorax
      2680, // Rashok, the Elder
      2685, // Sarkareth
      2689, // The Vigilant Steward, Zskarn
      2728, // Council of Dreams
      2677, // Fyrakk, the Blazing
      2820, // Gnarlroot
      2709, // Igira the Cruel
      2731, // Larodar, Keeper of the Flame
      2708, // Nymue, Weaver of the Cycle
      2824, // Smolderon
      2786, // Tindral Sageswift, Seer of Flame
      2737, // Volcoross
      62526, // Algeth'ar Academy
      62515, // The Azure Vault
      62516, // The Nokhud Offensive
      62521, // Ruby Life Pools
      62520, // Brackenhide Hollow
      62527, // Halls of Infusion
      62519, // Neltharus
      62451, // Uldaman: Legacy of Tyr
    ],
  },
  {
    name: "DF S3",
    slug: "df-season-3",
    startDates: {
      us: offsetByRegion(1_699_974_000_000, "us"),
      eu: offsetByRegion(1_699_974_000_000, "eu"),
      kr: offsetByRegion(1_699_974_000_000, "kr"),
      tw: offsetByRegion(1_699_974_000_000, "tw"),
    },
    endDates: {
      us: offsetByRegion(1_713_848_400_000, "us"),
      eu: offsetByRegion(1_713_848_400_000, "eu"),
      kr: offsetByRegion(1_713_848_400_000, "kr"),
      tw: offsetByRegion(1_713_848_400_000, "tw"),
    },
    seasonIcon:
      "https://assets.rpglogs.com/img/warcraft/zones/zone-36.png",
    encounterIds: [
      2728, // Council of Dreams
      2677, // Fyrakk, the Blazing
      2820, // Gnarlroot
      2709, // Igira the Cruel
      2731, // Larodar, Keeper of the Flame
      2708, // Nymue, Weaver of the Cycle
      2824, // Smolderon
      2786, // Tindral Sageswift, Seer of Flame
      2737, // Volcoross
      61763, // Atal'Dazar
      61501, // Black Rook Hold
      61466, // Darkheart Thicket
      61279, // Everbloom
      12579, // Dawn of the Infinites: Galakrond's Fall
      12580, // Dawn of the Infinites: Murozond's Rise
      10643, // Throne of the Tides
      61862, // Waycrest Manor
    ],
  },
  {
    name: "DF S2",
    slug: "df-season-2",
    startDates: {
      us: offsetByRegion(1_683_644_400_000, "us"),
      eu: offsetByRegion(1_683_644_400_000, "eu"),
      kr: offsetByRegion(1_683_644_400_000, "kr"),
      tw: offsetByRegion(1_683_644_400_000, "tw"),
    },
    endDates: {
      us: offsetByRegion(1_699_336_800_000, "us"),
      eu: offsetByRegion(1_699_336_800_000, "eu"),
      kr: offsetByRegion(1_699_336_800_000, "kr"),
      tw: offsetByRegion(1_699_336_800_000, "tw"),
    },
    seasonIcon:
      "https://assets.rpglogs.com/img/warcraft/zones/zone-34.png",
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
      us: offsetByRegion(1_670_943_600_000, "us"),
      eu: offsetByRegion(1_670_943_600_000, "eu"),
      kr: offsetByRegion(1_670_943_600_000, "kr"),
      tw: offsetByRegion(1_670_943_600_000, "tw"),
    },
    endDates: {
      us: offsetByRegion(1_683_007_200_000, "us"),
      eu: offsetByRegion(1_683_007_200_000, "eu"),
      kr: offsetByRegion(1_683_007_200_000, "kr"),
      tw: offsetByRegion(1_683_007_200_000, "tw"),
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
  timestamp = Date.now(),
): Season | null => {
  const season = seasons.find(
    (season) =>
      Object.values(season.startDates).some(
        (start) => start && timestamp >= start,
      ) &&
      Object.values(season.endDates).some(
        (end) => end === UNKNOWN_SEASON_START_OR_ENDING || end > timestamp,
      ),
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
        season.startDates.us !== null && Date.now() >= season.startDates.us,
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
