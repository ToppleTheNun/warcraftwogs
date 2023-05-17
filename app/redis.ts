import { Redis } from "@upstash/redis";

import { env } from "~/env/server";

const globalForUpstash = global as unknown as { upstash: Redis };

export const upstash =
  globalForUpstash.upstash ||
  new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

if (process.env.NODE_ENV !== "production") {
  globalForUpstash.upstash = upstash;
}
