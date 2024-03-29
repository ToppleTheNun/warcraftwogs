import type { Regions } from "@prisma/client";
import { useNavigation } from "@remix-run/react";
import clsx from "clsx";
import { format } from "date-fns/format";
import { enUS } from "date-fns/locale/en-US";

import { ExternalLink } from "~/components/ExternalLink";
import { basicLinkClassName } from "~/components/old/tokens";
import type { WordOfGloryLeaderboardEntry } from "~/load.server";
import { realms } from "~/realms";
import type { EnhancedSeason } from "~/seasons";
import { isPresent } from "~/typeGuards";

const buildWclUrl = (entry: WordOfGloryLeaderboardEntry) => {
  const base = `https://www.warcraftlogs.com/reports/${entry.report}`;
  const parts = [
    `fight=${entry.fight}`,
    "type=healing",
    "ability=85673",
    "view=events",
    entry.relativeTimestamp >= 0
      ? `start=${entry.relativeTimestamp - 500}`
      : null,
    entry.relativeTimestamp >= 0
      ? `end=${entry.relativeTimestamp + 500}`
      : null,
  ]
    .filter(isPresent)
    .join("&");
  return `${base}#${parts}`;
};

interface LeaderboardRowProps {
  entry: WordOfGloryLeaderboardEntry;
  idx: number;
}
const LeaderboardRow = ({ entry, idx }: LeaderboardRowProps) => {
  const realm = realms[entry.region].find(
    (realm) => realm.name.replace(" ", "") === entry.realm
  );
  const playerUrl = realm
    ? `https://warcraftlogs.com/character/${entry.region}/${
        realm.slug
      }/${entry.name.toLowerCase()}`
    : null;

  return (
    <tr
      className={clsx("border-b border-gray-700", {
        "bg-gray-900": idx % 2 === 0,
        "bg-gray-800": idx % 2 === 1,
      })}
    >
      <th
        scope="row"
        className="whitespace-nowrap px-6 py-4 font-medium text-white"
      >
        {playerUrl ? (
          <ExternalLink href={playerUrl}>
            {entry.name} - {realm?.name ?? entry.realm}
          </ExternalLink>
        ) : (
          <>
            {entry.name} - {realm?.name ?? entry.realm}
          </>
        )}
      </th>
      <td className="px-6 py-4">{entry.heal}</td>
      <td className="px-6 py-4">{entry.overheal}</td>
      <td className="px-6 py-4">{entry.totalHeal}</td>
      <td className="px-6 py-4">
        <time
          dateTime={format(entry.timestamp, "yyyy-MM-dd", { locale: enUS })}
          suppressHydrationWarning
        >
          {format(entry.timestamp, "yyyy-MM-dd", { locale: enUS })}
        </time>
      </td>
      <td className="px-6 py-4">
        <ExternalLink href={buildWclUrl(entry)}>WCL</ExternalLink>
      </td>
    </tr>
  );
};

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
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full w-max lg:w-full text-left text-sm text-gray-400 whitespace-nowrap">
          <caption className="bg-gray-800 p-5 text-left text-lg font-semibold text-white">
            {region.toUpperCase()}
            <p className="mt-1 text-sm font-normal text-gray-400">
              WoGs cast on targets with{" "}
              <a
                suppressHydrationWarning
                className={basicLinkClassName}
                data-wowhead="spell=255312"
                href="https://www.wowhead.com/spell=255312/guardian-spirit"
                target="_blank"
                rel="noreferrer noopener"
              >
                Guardian Spirit
              </a>{" "}
              and{" "}
              <a
                suppressHydrationWarning
                className={basicLinkClassName}
                data-wowhead="spell=55233"
                href="https://www.wowhead.com/spell=55233/vampiric-blood"
                target="_blank"
                rel="noreferrer noopener"
              >
                Vampiric Blood
              </a>{" "}
              active are disqualified from the leaderboard.
            </p>
          </caption>
          <thead className="bg-gray-700 text-xs uppercase text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Character
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
              <LeaderboardRow entry={entry} idx={idx} key={entry.id} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
