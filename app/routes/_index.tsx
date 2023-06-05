import { redirect, type TypedResponse } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import { serverTiming } from "~/constants";
import { findSeasonByName } from "~/seasons";
import type { Timings } from "~/timing.server";
import { getServerTimeHeader, time } from "~/timing.server";

export const loader = async (): Promise<TypedResponse<never>> => {
  const timings: Timings = {};

  const latest = await time(() => findSeasonByName("latest"), {
    type: "findSeasonByName-latest",
    timings,
  });

  if (!latest) {
    throw new Error("Couldn't determine latest season.");
  }

  return redirect(`/${latest.slug}`, {
    status: 307,
    headers: {
      [serverTiming]: getServerTimeHeader(timings),
    },
  });
};

export default function Index(): JSX.Element {
  return <Outlet />;
}
