import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { format } from "prettier";

const date = new Date();

const contents = `
export const generated = {
  BUILD_TIME: "${date.toISOString()}",
  BUILD_TIMESTAMP: "${Number(date).toString()}",
  COMMIT_SHA: "${process.env.VERCEL_GIT_COMMIT_SHA ?? ""}",
} as const;
`;

writeFileSync(
    join(process.cwd(), "app", "env", "generated.ts"),
    format(contents, { parser: "typescript" }),
    "utf-8"
);
