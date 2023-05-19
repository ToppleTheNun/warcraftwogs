import { type ComponentPropsWithoutRef } from "react";

import { item as itemLink, itemData, spellData } from "../wowhead";

type ItemLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  isPtr: boolean;
  item: number;
};
export const WowheadItemLink = ({
  children,
  isPtr,
  item,
  ...props
}: ItemLinkProps): JSX.Element => {
  return (
    <a
      data-wowhead={itemData(item, isPtr)}
      href={itemLink(item, isPtr)}
      {...props}
    >
      {children}
    </a>
  );
};

type SpellLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  isPtr: boolean;
  spell: number;
};
export const WowheadSpellLink = ({
  children,
  isPtr,
  spell,
  ...props
}: SpellLinkProps): JSX.Element => {
  return (
    <a
      data-wowhead={spellData(spell, isPtr)}
      href={spellData(spell, isPtr)}
      {...props}
    >
      {children}
    </a>
  );
};
