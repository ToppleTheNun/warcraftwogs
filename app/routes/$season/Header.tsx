import { RegionToggle } from "~/routes/$season/RegionToggle";
import type { EnhancedSeason } from "~/seasons";

import { Logo } from "./Logo";
import { SeasonMenu } from "./SeasonMenu";

export function Header({ season }: { season: EnhancedSeason }): JSX.Element {
  return (
    <>
      <header className="flex h-20 items-center justify-between border-b  border-gray-700 p-6 text-stone-100 drop-shadow-sm print:hidden">
        <nav className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
          <ul>
            <li>
              <Logo />
            </li>
          </ul>
          <SeasonMenu />
        </nav>
      </header>
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
        <div className="flex w-full flex-col flex-wrap justify-between gap-3 pt-4 md:flex-row md:px-4">
          <RegionToggle season={season} />
        </div>
      </div>
    </>
  );
}
