import "dotenv/config";

import { writeFileSync } from "node:fs";
import { join } from "node:path";

import type { Regions } from "@prisma/client";
import { ofetch } from "ofetch";
import { format } from "prettier";

import { env } from "~/env/server";
import { error } from "~/log";

export const authenticateWithBlizzard = (): Promise<string | null> => {
  return ofetch(
    `https://us.battle.net/oauth/token?grant_type=client_credentials&client_id=${env.BATTLE_NET_CLIENT_ID}&client_secret=${env.BATTLE_NET_CLIENT_SECRET}`,
    {
      method: "POST",
    }
  )
    .then((json) => {
      if ("access_token" in json) {
        return json.access_token;
      }

      return null;
    })
    .catch(error);
};

export const retrieveDataFromBlizzard = (
  region: Regions,
  locale: string,
  accessToken: string
): Promise<RealmsResponse | NotFound> => {
  const url = `https://${region}.api.blizzard.com/data/wow/realm/index?namespace=dynamic-${region}&locale=${locale}&access_token=${accessToken}`;

  return ofetch<RealmsResponse | NotFound>(url);
};

(async () => {
  const accessToken = await authenticateWithBlizzard();
  if (!accessToken) {
    throw new Error("Unable to authenticate with Blizzard!");
  }
  const usRealms = await retrieveDataFromBlizzard("us", "en_US", accessToken);
  const euRealms = await retrieveDataFromBlizzard("eu", "ru_RU", accessToken);
  const krRealms = await retrieveDataFromBlizzard("kr", "ko_KR", accessToken);
  const twRealms = await retrieveDataFromBlizzard("tw", "zh_TW", accessToken);

  const realmsByRegion: Record<Regions, SimpleRealm[]> = {
    us: [],
    eu: [],
    kr: [],
    tw: [],
  };
  if (!("code" in usRealms)) {
    realmsByRegion["us"] = usRealms.realms.map<SimpleRealm>(
      ({ name, slug }) => ({ name, slug })
    );
  }
  if (!("code" in euRealms)) {
    realmsByRegion["eu"] = euRealms.realms.map<SimpleRealm>(
      ({ name, slug }) => ({ name, slug })
    );
  }
  if (!("code" in krRealms)) {
    realmsByRegion["kr"] = krRealms.realms.map<SimpleRealm>(
      ({ name, slug }) => ({ name, slug })
    );
  }
  if (!("code" in twRealms)) {
    realmsByRegion["tw"] = twRealms.realms.map<SimpleRealm>(
      ({ name, slug }) => ({ name, slug })
    );
  }

  const tsOutput = `
    import type { Regions } from "@prisma/client";

    interface Realm {
      name: string;
      slug: string;
    }
    
    export const realms: Record<Regions, Realm[]> = ${JSON.stringify(
      realmsByRegion
    )};
  `;
  writeFileSync(
    join(process.cwd(), "app", "realms.ts"),
    format(tsOutput, { parser: "typescript" }),
    {
      encoding: "utf-8",
    }
  );
})();

interface NotFound {
  code: 404;
  type: "BLZWEBAPI00000404";
  detail: "Not Found";
}

interface RealmsResponse {
  _links: Links;
  realms: Realm[];
}

interface Links {
  self: Link;
}

interface Link {
  href: string;
}

interface Realm {
  key: Link;
  name: string;
  id: number;
  slug: string;
}

interface SimpleRealm {
  name: string;
  slug: string;
}
