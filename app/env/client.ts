import { z } from "zod";

import { generated } from "~/env/generated";

/**
 * Client accessible variables go here.
 */
export const clientSchema = z.object({
  BUILD_TIME: z.string(),
  BUILD_TIMESTAMP: z.string(),
  COMMIT_SHA: z.string(),
  SENTRY_DSN: z.string().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
});

/**
 * Can't destruct `process.env` on client-side, so destruct here instead.
 */
export const clientProcessEnv = { ...generated };

const parsed = clientSchema.safeParse(clientProcessEnv);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
