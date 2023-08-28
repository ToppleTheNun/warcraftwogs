import { Redis } from "@upstash/redis";

import { singleton } from "~/lib/singleton.server";

export const upstash = singleton(
  "upstash",
  () =>
    new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
);
