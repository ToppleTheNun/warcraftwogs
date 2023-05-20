import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";
import { getWordOfGloryHealing } from "~/wcl/queries";
import type { WordOfGloryHealEventArray } from "~/wcl/schemas";
import { wordOfGloryHealEventArraySchema } from "~/wcl/schemas";

export type BasicWordOfGlory = {
  report: string;
  reportFight: string;
  fight: string;

};

export const getWordOfGloryHealingEvents = async (
  reportID: string,
  fightIDs: number[],
  timings: Timings
): Promise<WordOfGloryHealEventArray> => {
  const rawHealingEventsData = await time(
    () => getWordOfGloryHealing({ reportID, fightIDs }),
    { type: "", timings }
  );
  const rawWordOfGloryHealingEvents =
    rawHealingEventsData.reportData?.report?.events?.data;
  const wordOfGloryHealingEventsResult =
    wordOfGloryHealEventArraySchema.safeParse(rawWordOfGloryHealingEvents);
  if (!wordOfGloryHealingEventsResult.success) {
    return [];
  }

  return wordOfGloryHealingEventsResult.data;
};

