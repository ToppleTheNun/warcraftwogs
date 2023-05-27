import type { Regions } from "@prisma/client";

import { env } from "~/env/server";
import { debug, info } from "~/log";
import { upstash } from "~/redis";

export type WordOfGloryLeaderboardEntry = {
  id: string;
  name: string;
  realm: string;
  region: Regions;
  heal: number;
  overheal: number;
  totalHeal: number;
  report: string;
  fight: number;
  relativeTimestamp: number;
  timestamp: number;
  character: number;
};

export const persistLeaderboardEntriesForSeason = async (
  key: string,
  leaderboardEntries: WordOfGloryLeaderboardEntry[]
) => {
  if (env.NODE_ENV === "development") {
    debug("Not persisting entries in Redis due to running in development");
    return null;
  }
  info("Persisting entries in Redis");
  return upstash.set(key, leaderboardEntries, { ex: 60 * 60 });
};

export const loadLeaderboardEntriesForSeason = async (key: string) => {
  if (env.NODE_ENV === "development") {
    debug("Not retrieving entries from Redis due to running in development");
    return null;
  }
  info("Retrieving entries from Redis");
  return upstash.get<WordOfGloryLeaderboardEntry[]>(key);
};
