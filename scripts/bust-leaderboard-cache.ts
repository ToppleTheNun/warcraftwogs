import "dotenv/config";

import { Regions } from "@prisma/client";

import { searchParamSeparator } from "~/constants";
import { clearLeaderboardEntriesCache } from "~/lib/cache.server";
import { getEnv, init } from "~/lib/env.server";
import { loadDataForRegion } from "~/load.server";
import { seasons } from "~/seasons";

(async () => {
  init();
  global.ENV = getEnv();

  await Promise.all(
    seasons.flatMap((season) =>
      Object.values(Regions).map(async (region) => {
        const key = [season.slug, region].join(searchParamSeparator);
        await clearLeaderboardEntriesCache(key, true);

        await loadDataForRegion(region, season, {}, true);
      })
    )
  );
})();
