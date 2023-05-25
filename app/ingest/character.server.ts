import { prisma } from "~/db";
import type { IngestibleReportWordOfGlory } from "~/ingest/types";
import type { Timings } from "~/timing.server";
import { time } from "~/timing.server";

export const findOrCreateCharacter = (
  ingestibleWordOfGlory: IngestibleReportWordOfGlory,
  timings: Timings
) =>
  time(
    () =>
      prisma.character.upsert({
        where: {
          id: ingestibleWordOfGlory.source.guid,
        },
        update: {},
        create: {
          id: ingestibleWordOfGlory.source.guid,
          name: ingestibleWordOfGlory.source.name,
          server: ingestibleWordOfGlory.source.server,
          region: ingestibleWordOfGlory.region,
        },
      }),
    {
      type: "findOrCreateCharacter",
      timings,
    }
  );
