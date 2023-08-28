import type { Regions } from "@prisma/client";

import { prisma } from "~/lib/db.server";
import type { Timings } from "~/lib/timing.server";
import { time } from "~/lib/timing.server";

export const getMinimumAmountOfHealing = async (
  parsesToCheck: number,
  region: Regions,
  timings: Timings,
) => {
  const result = await time(
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
          fight: {
            is: {
              region,
            },
          },
        },
      }),
    { type: "getMinimumAmountOfHealing", timings },
  );
  return result._min.heal ?? 0;
};

export const getMinimumAmountOfOverhealing = async (
  parsesToCheck: number,
  region: Regions,
  timings: Timings,
) => {
  const result = await time(
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
          fight: {
            is: {
              region,
            },
          },
        },
      }),
    { type: "getMinimumAmountOfOverhealing", timings },
  );
  return result._min.overheal ?? 0;
};

export const getMinimumAmountOfTotalHealing = async (
  parsesToCheck: number,
  region: Regions,
  timings: Timings,
) => {
  const result = await time(
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
          fight: {
            is: {
              region,
            },
          },
        },
      }),
    { type: "getMinimumAmountOfTotalHealing", timings },
  );
  return result._min.totalHeal ?? 0;
};
