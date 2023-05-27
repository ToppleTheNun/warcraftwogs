import { Link } from "@remix-run/react";

import { Header as BaseHeader } from "~/components/Header";
import { RegionToggle } from "~/routes/$season/RegionToggle";
import type { EnhancedSeason } from "~/seasons";

export const Header = ({ season }: { season: EnhancedSeason }): JSX.Element => {
  return (
    <BaseHeader
      includeLogIngest
      includeSeasonMenu
      headerChildren={
        <Link to="/faq" className="font-medium text-white hover:underline">
          FAQ
        </Link>
      }
    >
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
        <div className="flex w-full flex-col flex-wrap justify-between gap-3 pt-4 md:flex-row md:px-4 2xl:px-0">
          <RegionToggle season={season} />
        </div>
      </div>
    </BaseHeader>
  );
};
