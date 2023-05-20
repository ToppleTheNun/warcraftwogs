import { getCachedSdk } from "~/wcl/client";
import type {
  GetCombatantInfosQuery,
  GetCombatantInfosQueryVariables,
  GetFightsByIdQuery,
  GetFightsByIdQueryVariables,
  GetFightsQuery,
  GetFightsQueryVariables,
  GetPlayerDetailsQuery,
  GetPlayerDetailsQueryVariables,
  GetWordOfGloryHealingEventsQuery,
  GetWordOfGloryHealingEventsQueryVariables,
} from "~/wcl/types";

export const getFights = async (
  params: GetFightsQueryVariables
): Promise<GetFightsQuery> => {
  const sdk = await getCachedSdk();

  return sdk.getFights(params);
};

export const getFightsById = async (
  params: GetFightsByIdQueryVariables
): Promise<GetFightsByIdQuery> => {
  const sdk = await getCachedSdk();

  return sdk.getFightsById(params);
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

export const getCombatantInfos = async (
  params: GetCombatantInfosQueryVariables
): Promise<GetCombatantInfosQuery> => {
  const sdk = await getCachedSdk();

  return sdk.getCombatantInfos(params);
};
