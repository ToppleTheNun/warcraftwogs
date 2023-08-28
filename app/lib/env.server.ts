import { z } from "zod";
import { generated } from "~/env/generated";

const schema = z.object({
  // Client
  BUILD_TIME: z.string(),
  BUILD_TIMESTAMP: z.string(),
  COMMIT_SHA: z.string(),
  SENTRY_DSN: z.string().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
  // Server
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  WARCRAFT_LOGS_CLIENT_ID: z.string(),
  WARCRAFT_LOGS_CLIENT_SECRET: z.string(),
  BATTLE_NET_CLIENT_ID: z.string().optional(),
  BATTLE_NET_CLIENT_SECRET: z.string().optional(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse({ ...process.env, ...generated });

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    BUILD_TIME: process.env.BUILD_TIME,
    BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP,
    COMMIT_SHA: process.env.COMMIT_SHA,
    SENTRY_DSN: process.env.SENTRY_DSN,
    VERCEL_ANALYTICS_ID: process.env.VERCEL_ANALYTICS_ID,
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}
