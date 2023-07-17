import { writeFile } from "node:fs/promises";
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

(async () => {
  const formatted = await format(contents, { parser: "typescript" });
  await writeFile(
    join(process.cwd(), "app", "env", "generated.ts"),
    formatted,
    "utf-8",
  );
})();
