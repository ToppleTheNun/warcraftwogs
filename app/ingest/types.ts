import type { Fight, Regions, WordOfGlory } from "@prisma/client";

import type { PlayerDetail, WordOfGloryHealEvent } from "~/wcl/schemas";

export type ReportFight = {
  report: string;
  fightID: number;
  startTime: number;
  endTime: number;
  encounterID: number;
  difficulty: number;
  region: Regions;
  friendlyPlayerIds: number[];
};

export type IngestibleReportFight = ReportFight & {
  friendlyPlayerDetails: PlayerDetail[];
  friendlyPlayers: string;
};

export type IngestedReportFight = IngestibleReportFight & {
  fight: Fight;
};

export type RequiredHealing = {
  heal: number;
  overheal: number;
  totalHeal: number;
};

export type ReportWordOfGlory = WordOfGloryHealEvent & {
  report: string;
  relativeTimestamp: number;
};

export type IngestibleReportWordOfGlory = ReportWordOfGlory & {
  totalHeal: number;
  region: Regions;
  ingestedFightId: string;
  source: PlayerDetail;
  target: PlayerDetail;
};

export type IngestedReportWordOfGlory = IngestibleReportWordOfGlory & {
  wordOfGlory: WordOfGlory;
};

export type Report = {
  reportID: string;
  title: string;
  region: Regions;
  startTime: number;
  endTime: number;
  reportFights: ReportFight[];
};

export type ReportWithIngestibleFights = Report & {
  ingestibleFights: IngestibleReportFight[];
};

export type ReportWithIngestedFights = ReportWithIngestibleFights & {
  ingestedFights: IngestedReportFight[];
};

export type ReportWithIngestedWordOfGlorys = ReportWithIngestedFights & {
  ingestedWordOfGlorys: IngestedReportWordOfGlory[];
};
