import { json, type LoaderArgs, type TypedResponse } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { getEnhancedSeason } from "~/models/season.server";
import { Footer } from "~/routes/$season/Footer";
import { Header } from "~/routes/$season/Header";
import { findSeasonByName, type Season as SeasonType } from "~/seasons";

export const loader = ({ params }: LoaderArgs): TypedResponse<SeasonType> => {
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

  const { season: enhancedSeason, headers } = getEnhancedSeason({
    season,
  });

  return json(enhancedSeason, headers);
};

export default function Season(): JSX.Element {
  const season = useLoaderData<typeof loader>();

  return (
    <>
      <Header />
      <main className="container mt-4 flex max-w-screen-2xl flex-1 flex-col space-y-4 px-4 md:mx-auto 2xl:px-0">
        <h1 className="text-lg">Word of Glory Healing Leaderboard</h1>
      </main>
      <Footer />
    </>
  );
}
