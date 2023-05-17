import type { Regions } from "@prisma/client";
import { useNavigation } from "@remix-run/react";
import clsx from "clsx";
import formatISO from "date-fns/formatISO";

import type { WordOfGloryLeaderboardEntry } from "~/load.server";
import type { EnhancedSeason } from "~/seasons";

interface LeaderboardRowProps {
  entry: WordOfGloryLeaderboardEntry;
  idx: number;
}
const LeaderboardRow = ({ entry, idx }: LeaderboardRowProps) => (
  <tr
    className={clsx("border-b dark:border-gray-700", {
      "bg-white dark:bg-gray-900": idx % 2 === 0,
      "bg-gray-50 dark:bg-gray-800": idx % 2 === 1,
    })}
  >
    <th
      scope="row"
      className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
    >
      {entry.name}
    </th>
    <td className="px-6 py-4">{entry.realm}</td>
    <td className="px-6 py-4">{entry.region.toUpperCase()}</td>
    <td className="px-6 py-4">{entry.heal}</td>
    <td className="px-6 py-4">{entry.overheal}</td>
    <td className="px-6 py-4">{entry.totalHeal}</td>
    <td className="px-6 py-4">{formatISO(entry.timestamp)}</td>
    <td className="px-6 py-4">
      <a
        href={`https://www.warcraftlogs.com/reports/${entry.report}#fight=${entry.fight}&type=healing&ability=85673&view=events`}
        target="_blank"
        rel="noreferrer noopener"
      >
        WCL
      </a>
    </td>
  </tr>
);

interface LeaderboardProps {
  region: Regions;
  season: EnhancedSeason;
}
export const Leaderboard = ({ region, season }: LeaderboardProps) => {
  const navigation = useNavigation();

  return (
    <section
      className={clsx(
        navigation.state === "loading" && "grayscale",
        "max-w-screen-2xl rounded-md bg-gray-700 transition-all duration-500 ease-linear motion-reduce:transition-none"
      )}
      aria-labelledby={`title-${region}`}
      id={region}
    >
      <h1 id={`title-${region}`} className="text-center text-lg font-bold">
        {region.toUpperCase()}
      </h1>

      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Character Name
              </th>
              <th scope="col" className="px-6 py-3">
                Realm
              </th>
              <th scope="col" className="px-6 py-3">
                Region
              </th>
              <th scope="col" className="px-6 py-3">
                Healed
              </th>
              <th scope="col" className="px-6 py-3">
                Overhealed
              </th>
              <th scope="col" className="px-6 py-3">
                Total Healed
              </th>
              <th scope="col" className="px-6 py-3">
                Timestamp
              </th>
              <th scope="col" className="px-6 py-3">
                Link
              </th>
            </tr>
          </thead>
          <tbody>
            {season.dataByRegion[region].map((entry, idx) => (
              <LeaderboardRow
                entry={entry}
                idx={idx}
                key={`${entry.name}-${entry.timestamp}`}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
