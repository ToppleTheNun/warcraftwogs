import { access, mkdir, writeFile } from "node:fs/promises";
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

const ensureDir = async (path: string) => {
  try {
    await access(path);
  } catch (e) {
    await mkdir(path);
  }
};

(async () => {
  const formatted = await format(contents, { parser: "typescript" });
  const pathToEnv = join(process.cwd(), "app", "env");
  await ensureDir(pathToEnv);
  await writeFile(join(pathToEnv, "generated.ts"), formatted, "utf-8");
})();
