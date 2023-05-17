import { z } from "zod";

import { clientSchema } from "~/env/client";
import { generated } from "~/env/generated";

/**
 * Server accessible values go here.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  WARCRAFT_LOGS_CLIENT_ID: z.string(),
  WARCRAFT_LOGS_CLIENT_SECRET: z.string(),
});

export const mergedSchema = serverSchema.merge(clientSchema);

const parsed = mergedSchema.safeParse({ ...process.env, ...generated });
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
