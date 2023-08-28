import { PrismaClient } from "@prisma/client";

import { singleton } from "~/lib/singleton.server";

export const prisma = singleton(
  "prisma",
  () =>
    new PrismaClient({
      log: ["query", "info", "warn", "error"],
    }),
);
