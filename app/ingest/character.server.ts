import type { IngestibleReportWordOfGlory } from "~/ingest/types";
import { prisma } from "~/lib/db.server";
import type { Timings } from "~/lib/timing.server";
import { time } from "~/lib/timing.server";

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
