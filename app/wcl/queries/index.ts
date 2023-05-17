import { getCachedSdk } from "~/wcl/client";
import type {
  GetFightsQuery,
  GetFightsQueryVariables,
  GetPlayerDetailsQuery,
  GetPlayerDetailsQueryVariables,
  GetWordOfGloryHealingEventsQuery,
  GetWordOfGloryHealingEventsQueryVariables,
} from "~/wcl/types";

export const getInitialReportData = async (
  params: GetFightsQueryVariables
): Promise<GetFightsQuery> => {
  const sdk = await getCachedSdk();

  return sdk.getFights(params);
};

export const getWordOfGloryHealing = async (
  params: GetWordOfGloryHealingEventsQueryVariables
): Promise<GetWordOfGloryHealingEventsQuery> => {
  const sdk = await getCachedSdk();

  return sdk.getWordOfGloryHealingEvents(params);
};

export const getPlayerDetails = async (
  params: GetPlayerDetailsQueryVariables
): Promise<GetPlayerDetailsQuery> => {
  const sdk = await getCachedSdk();

  return sdk.getPlayerDetails(params);
};
