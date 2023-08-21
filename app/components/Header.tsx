import type { ReactNode } from "react";

import { Logo } from "~/components/Logo";
import { LogIngest } from "~/routes/$season/LogIngest";
import { SeasonMenu } from "~/routes/$season/SeasonMenu";

interface HeaderProps {
  children?: ReactNode;
  headerChildren?: ReactNode;
  includeLogIngest?: boolean;
  includeSeasonMenu?: boolean;
}
export const Header = ({
  children,
  headerChildren = false,
  includeLogIngest = false,
  includeSeasonMenu = false,
}: HeaderProps) => (
  <>
    <header className="flex h-20 items-center justify-between border-b border-gray-700 p-6 text-stone-100 drop-shadow-sm print:hidden">
      <nav className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
        <ul>
          <li>
            <Logo />
          </li>
        </ul>
        <div className="flex flex-row items-center gap-3">
          {headerChildren ? <>{headerChildren}</> : null}
          {includeSeasonMenu ? <SeasonMenu /> : null}
        </div>
      </nav>
    </header>
    {children}
    {includeLogIngest ? (
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between">
        <div className="flex w-full flex-col flex-wrap justify-between gap-3 py-4 md:px-4 2xl:px-0">
          <LogIngest />
        </div>
      </div>
    ) : null}
  </>
);
