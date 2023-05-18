import type { Regions } from "@prisma/client";
import setMilliseconds from "date-fns/setMilliseconds";

import { prisma } from "~/db";
import type { WordOfGloryLeaderboardEntry } from "~/load.server";
import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";
import { isRegion } from "~/utils";

export const getMinimumAmountOfHealing = (
  parsesToCheck: number,
  region: Regions,
  timings: Timings
) =>
  time(
    () =>
      prisma.wordOfGlory.aggregate({
        _min: {
          heal: true,
        },
        take: parsesToCheck,
        orderBy: {
          heal: "desc",
        },
        where: {
          character: {
            is: {
              region,
            },
          },
        },
      }),
    { type: "getMinimumAmountOfHealing", timings }
  );

export const getMinimumAmountOfOverhealing = (
  parsesToCheck: number,
  region: Regions,
  timings: Timings
) =>
  time(
    () =>
      prisma.wordOfGlory.aggregate({
        _min: {
          overheal: true,
        },
        take: parsesToCheck,
        orderBy: {
          overheal: "desc",
        },
        where: {
          character: {
            is: {
              region,
            },
          },
        },
      }),
    { type: "getMinimumAmountOfOverhealing", timings }
  );

export const getMinimumAmountOfTotalHealing = (
  parsesToCheck: number,
  region: Regions,
  timings: Timings
) =>
  time(
    () =>
      prisma.wordOfGlory.aggregate({
        _min: {
          totalHeal: true,
        },
        take: parsesToCheck,
        orderBy: {
          totalHeal: "desc",
        },
        where: {
          character: {
            is: {
              region,
            },
          },
        },
      }),
    { type: "getMinimumAmountOfTotalHealing", timings }
  );

export const createWordOfGlory = (
  entry: WordOfGloryLeaderboardEntry,
  timings: Timings
) =>
  time(
    () => {
      const roundedTimestamp = setMilliseconds(entry.timestamp, 0).getTime();
      const derivedId = [
        entry.report,
        entry.region,
        entry.realm,
        entry.name,
        roundedTimestamp,
      ].join(":");
      return prisma.wordOfGlory.upsert({
        where: {
          id: derivedId,
        },
        update: {
          report: entry.report,
          fight: entry.fight,
          heal: entry.heal,
          overheal: entry.overheal,
          totalHeal: entry.totalHeal,
          character: {
            connectOrCreate: {
              where: {
                id: entry.character,
              },
              create: {
                id: entry.character,
                name: entry.name,
                server: entry.realm,
                region: isRegion(entry.region) ? entry.region : "us",
              },
            },
          },
        },
        create: {
          id: derivedId,
          report: entry.report,
          fight: entry.fight,
          heal: entry.heal,
          overheal: entry.overheal,
          totalHeal: entry.totalHeal,
          character: {
            connectOrCreate: {
              where: {
                id: entry.character,
              },
              create: {
                id: entry.character,
                name: entry.name,
                server: entry.realm,
                region: isRegion(entry.region) ? entry.region : "us",
              },
            },
          },
        },
      });
    },
    { type: "createWordOfGlory", timings }
  );
