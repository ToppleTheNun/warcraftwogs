import type { Regions } from "@prisma/client";
import { produce } from "immer";
import groupBy from "lodash/groupBy";

import { prisma } from "~/db";
import { findOrCreateCharacter } from "~/ingest/character.server";
import {
  DIFFERENT_REPORT_TOLERANCE,
  HEAL_AMOUNT_TOLERANCE,
  MINIMUM_GCD_MS,
} from "~/ingest/constants";
import type {
  IngestedReportWordOfGlory,
  IngestibleReportWordOfGlory,
  ReportWithIngestedFights,
  ReportWithIngestedWordOfGlorys,
  ReportWordOfGlory,
  RequiredHealing,
} from "~/ingest/types";
import {
  getMinimumAmountOfHealing,
  getMinimumAmountOfOverhealing,
  getMinimumAmountOfTotalHealing,
} from "~/models/wordOfGlory.server";
import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";
import { isPresent } from "~/typeGuards";
import { isWithinTolerance } from "~/utils";
import { getWordOfGloryHealing } from "~/wcl/queries";
import { wordOfGloryHealEventArraySchema } from "~/wcl/schemas";

const getReportWordOfGlorys = async (
  report: ReportWithIngestedFights,
  timings: Timings
): Promise<ReportWordOfGlory[]> => {
  const reportID = report.reportID;
  const fightIDs = report.ingestedFights.map((fight) => fight.fightID);

  const rawHealingEventsData = await time(
    () => getWordOfGloryHealing({ reportID: report.reportID, fightIDs }),
    { type: "getWordOfGloryHealing", timings }
  );
  const rawWordOfGloryHealingEvents =
    rawHealingEventsData.reportData?.report?.events?.data;
  const wordOfGloryHealingEventsResult =
    wordOfGloryHealEventArraySchema.safeParse(rawWordOfGloryHealingEvents);
  if (!wordOfGloryHealingEventsResult.success) {
    return [];
  }

  return wordOfGloryHealingEventsResult.data.map((it) => ({
    ...it,
    report: reportID,
  }));
};

const makeReportWordOfGloryIngestible = (
  wordOfGlory: ReportWordOfGlory,
  report: ReportWithIngestedFights
): IngestibleReportWordOfGlory | null => {
  const reportFight = report.ingestedFights.find(
    (fight) =>
      fight.report === wordOfGlory.report && fight.fightID === wordOfGlory.fight
  );
  if (!reportFight) {
    return null;
  }
  const source = reportFight.friendlyPlayerDetails.find(
    (player) => wordOfGlory.sourceID === player.id
  );
  const target = reportFight.friendlyPlayerDetails.find(
    (player) => wordOfGlory.targetID === player.id
  );
  if (!source || !target) {
    return null;
  }
  return {
    ...wordOfGlory,
    timestamp: reportFight.startTime + wordOfGlory.timestamp,
    region: reportFight.region,
    totalHeal: wordOfGlory.amount + wordOfGlory.overheal,
    ingestedFightId: reportFight.fight.id,
    source,
    target,
  };
};

const numberOfParsesToCheck = 50;
const getRequiredHealingToIngest = async (
  region: Regions,
  timings: Timings
): Promise<RequiredHealing> => ({
  heal: await getMinimumAmountOfHealing(numberOfParsesToCheck, region, timings),
  overheal: await getMinimumAmountOfOverhealing(
    numberOfParsesToCheck,
    region,
    timings
  ),
  totalHeal: await getMinimumAmountOfTotalHealing(
    numberOfParsesToCheck,
    region,
    timings
  ),
});

const hasRequiredHealing = (
  wordOfGlory: IngestibleReportWordOfGlory,
  requiredHealing: RequiredHealing
) => {
  const heal = wordOfGlory.amount;
  const overheal = wordOfGlory.overheal;
  const totalHeal = heal + overheal;
  return (
    heal >= requiredHealing.heal ||
    overheal >= requiredHealing.overheal ||
    totalHeal >= requiredHealing.totalHeal
  );
};

/**
 * Reduces duplicate WoGs from Afterimage into the WoG that caused it to occur.
 */
export const afterimageReducer = (
  accumulator: IngestibleReportWordOfGlory[],
  wordOfGlory: IngestibleReportWordOfGlory
): IngestibleReportWordOfGlory[] => {
  const matchingWordOfGloryIdx = accumulator.findIndex(
    (fromAcc) =>
      isWithinTolerance({
        original: fromAcc.timestamp,
        toCheck: wordOfGlory.timestamp,
        tolerance: MINIMUM_GCD_MS,
      }) && fromAcc.source.guid === wordOfGlory.source.guid
  );
  if (matchingWordOfGloryIdx < 0) {
    return [...accumulator, wordOfGlory];
  }
  const matchingWordOfGlory = accumulator[matchingWordOfGloryIdx];
  if (!matchingWordOfGlory) {
    return accumulator;
  }
  return produce(accumulator, (draft) => {
    draft[matchingWordOfGloryIdx] = {
      ...matchingWordOfGlory,
      amount: matchingWordOfGlory.amount + wordOfGlory.amount,
      overheal: matchingWordOfGlory.overheal + wordOfGlory.overheal,
    };
  });
};

const ingestWordOfGlory = async (
  ingestibleWordOfGlory: IngestibleReportWordOfGlory,
  characterId: number,
  timings: Timings
): Promise<IngestedReportWordOfGlory> => {
  const existingWordOfGlory = await time(
    () =>
      prisma.wordOfGlory.findFirst({
        where: {
          fight: {
            id: ingestibleWordOfGlory.ingestedFightId,
          },
          timestamp: {
            gte: new Date(
              ingestibleWordOfGlory.timestamp - DIFFERENT_REPORT_TOLERANCE
            ),
            lte: new Date(
              ingestibleWordOfGlory.timestamp + DIFFERENT_REPORT_TOLERANCE
            ),
          },
          sourceId: ingestibleWordOfGlory.source.guid,
          targetId: ingestibleWordOfGlory.target.guid,
        },
      }),
    { type: "prisma.wordOfGlory.findFirst", timings }
  );
  if (!existingWordOfGlory) {
    const createdWordOfGlory = await time(
      () =>
        prisma.wordOfGlory.create({
          data: {
            report: ingestibleWordOfGlory.report,
            reportFightId: ingestibleWordOfGlory.fight,
            heal: ingestibleWordOfGlory.amount,
            overheal: ingestibleWordOfGlory.overheal,
            totalHeal: ingestibleWordOfGlory.totalHeal,
            timestamp: new Date(ingestibleWordOfGlory.timestamp),
            targetId: ingestibleWordOfGlory.target.guid,
            source: {
              connect: {
                id: characterId,
              },
            },
            fight: {
              connect: {
                id: ingestibleWordOfGlory.ingestedFightId,
              },
            },
          },
        }),
      {
        type: "prisma.wordOfGlory.create",
        timings,
      }
    );
    return { ...ingestibleWordOfGlory, wordOfGlory: createdWordOfGlory };
  }

  const healDiff = Math.abs(
    existingWordOfGlory.heal - ingestibleWordOfGlory.amount
  );
  const overhealDiff = Math.abs(
    existingWordOfGlory.overheal - ingestibleWordOfGlory.overheal
  );
  const totalHealDiff = Math.abs(
    existingWordOfGlory.totalHeal -
      (ingestibleWordOfGlory.amount + ingestibleWordOfGlory.overheal)
  );
  if (
    healDiff < HEAL_AMOUNT_TOLERANCE ||
    overhealDiff < HEAL_AMOUNT_TOLERANCE ||
    totalHealDiff < HEAL_AMOUNT_TOLERANCE
  ) {
    return { ...ingestibleWordOfGlory, wordOfGlory: existingWordOfGlory };
  }

  const updatedWordOfGlory = await time(
    () =>
      prisma.wordOfGlory.update({
        where: {
          id: existingWordOfGlory.id,
        },
        data: {
          heal: ingestibleWordOfGlory.amount,
          overheal: ingestibleWordOfGlory.overheal,
          totalHeal: ingestibleWordOfGlory.totalHeal,
        },
      }),
    {
      type: "prisma.wordOfGlory.update",
      timings,
    }
  );
  return { ...ingestibleWordOfGlory, wordOfGlory: updatedWordOfGlory };
};

const ingestWordOfGlorysForCharacter = async (
  ingestibleWordOfGlories: IngestibleReportWordOfGlory[],
  timings: Timings
) => {
  if (ingestibleWordOfGlories.length === 0) {
    return null;
  }
  const firstWordOfGlory = ingestibleWordOfGlories.at(0);
  if (!firstWordOfGlory) {
    return null;
  }
  const character = await findOrCreateCharacter(firstWordOfGlory, timings);
  return Promise.all(
    ingestibleWordOfGlories.map((wordOfGlory) =>
      ingestWordOfGlory(wordOfGlory, character.id, timings)
    )
  );
};

const ingestWordOfGlorys = (
  ingestibleWordOfGlories: IngestibleReportWordOfGlory[],
  timings: Timings
) => {
  const grouped = groupBy(
    ingestibleWordOfGlories,
    (wordOfGlory) => wordOfGlory.source.guid
  );

  return Promise.all(
    Object.values(grouped).map((wordOfGlorys) =>
      ingestWordOfGlorysForCharacter(wordOfGlorys, timings)
    )
  );
};

export const ingestWordOfGloryHealsFromReportForFights = async (
  report: ReportWithIngestedFights,
  timings: Timings
): Promise<ReportWithIngestedWordOfGlorys> => {
  const reportWordOfGlorys = await getReportWordOfGlorys(report, timings);
  const requiredHealing = await getRequiredHealingToIngest(
    report.region,
    timings
  );
  const ingestibleWordOfGlorys = reportWordOfGlorys
    .map((wordOfGlory) => makeReportWordOfGloryIngestible(wordOfGlory, report))
    .filter(isPresent)
    .filter((wordOfGlory) => hasRequiredHealing(wordOfGlory, requiredHealing))
    .reduce(afterimageReducer, []);
  const ingestedWordOfGlorys = await ingestWordOfGlorys(
    ingestibleWordOfGlorys,
    timings
  );
  const filteredIngestedWordOfGlorys = ingestedWordOfGlorys
    .flat()
    .filter(isPresent);

  return { ...report, ingestedWordOfGlorys: filteredIngestedWordOfGlorys };
};
