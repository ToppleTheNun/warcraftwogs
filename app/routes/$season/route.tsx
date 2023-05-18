import type { HeadersFunction } from "@remix-run/node";
import {
  json,
  type LoaderArgs,
  redirect,
  type TypedResponse,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import {
  determineRegionsToDisplayFromCookies,
  determineRegionsToDisplayFromSearchParams,
  searchParamSeparator,
} from "~/load.server";
import { getEnhancedSeason } from "~/models/season.server";
import { Footer } from "~/routes/$season/Footer";
import { Header } from "~/routes/$season/Header";
import { Leaderboard } from "~/routes/$season/Leaderboard";
import type { EnhancedSeason } from "~/seasons";
import { findSeasonByName } from "~/seasons";
import type { Timings } from "~/timing.server";
import { getServerTimeHeader, time } from "~/timing.server";

const lastModified = "Last-Modified";
const cacheControl = "Cache-Control";
const eTag = "ETag";
const setCookie = "Set-Cookie";
const expires = "Expires";
const serverTiming = "Server-Timing";

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const loaderCache = loaderHeaders.get(cacheControl);

  const headers: HeadersInit = {
    [cacheControl]: loaderCache ?? "public",
  };

  const expiresDate = loaderHeaders.get(expires);

  if (expiresDate) {
    // gets overwritten by cacheControl if present anyways
    headers.Expires = expiresDate;
  }

  const lastModifiedDate = loaderHeaders.get(lastModified);

  if (lastModifiedDate) {
    headers[lastModified] = lastModifiedDate;
  }

  const maybeETag = loaderHeaders.get(eTag);

  if (maybeETag) {
    headers[eTag] = maybeETag;
  }

  const maybeSetCookie = loaderHeaders.get(setCookie);

  if (maybeSetCookie) {
    headers[setCookie] = maybeSetCookie;
  }

  const serverTimings = loaderHeaders.get(serverTiming);

  if (serverTimings) {
    headers[serverTiming] = serverTimings;
  }

  return headers;
};

export const loader = async ({
  params,
  request,
}: LoaderArgs): Promise<TypedResponse<EnhancedSeason>> => {
  if (!("season" in params) || !params.season) {
    throw new Response(undefined, {
      status: 400,
      statusText: "Missing params.",
    });
  }

  const season = findSeasonByName(params.season);

  if (!season) {
    throw new Response(undefined, {
      status: 400,
      statusText: "Unknown season.",
    });
  }

  const timings: Timings = {};

  const searchParamRegions = await time(
    () => determineRegionsToDisplayFromSearchParams(request),
    { type: "determineRegionsToDisplayFromSearchParams", timings }
  );

  const cookieRegions = searchParamRegions
    ? null
    : await time(() => determineRegionsToDisplayFromCookies(request), {
        type: "determineRegionsToDisplayFromCookies",
        timings,
      });

  if (cookieRegions) {
    const params = new URLSearchParams();

    params.append("regions", cookieRegions.join(searchParamSeparator));

    return redirect(`/${season.slug}?${params.toString()}`, 307);
  }

  const regions = searchParamRegions;

  const { season: enhancedSeason, headers } = await time(
    () =>
      getEnhancedSeason({
        regions,
        season,
        timings,
      }),
    { type: "getEnhancedSeason", timings }
  );

  headers[serverTiming] = getServerTimeHeader(timings);

  return json(enhancedSeason, { headers });
};

export default function Season(): JSX.Element {
  const season = useLoaderData<typeof loader>();

  return (
    <>
      <Header season={season} />
      <main className="container mt-4 flex max-w-screen-2xl flex-1 flex-col space-y-4 px-4 md:mx-auto 2xl:px-0">
        <h1 className="text-lg">Word of Glory Healing Leaderboard</h1>
        {season.regionsToDisplay.map((region) => (
          <Leaderboard key={region} region={region} season={season} />
        ))}
      </main>
      <Footer />
    </>
  );
}
