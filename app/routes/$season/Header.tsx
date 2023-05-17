import { Logo } from "./Logo";
import { SeasonMenu } from "./SeasonMenu";

export function Header(): JSX.Element {
  return (
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
  );
}
