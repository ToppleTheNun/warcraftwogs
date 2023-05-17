import type { Regions } from "@prisma/client";

export const orderedRegionsBySize: Regions[] = ["eu", "us", "tw", "kr"];

export const getReportCode = (input: string): string | undefined => {
  const match = input
    .trim()
    .match(
      /^(.*reports\/)?((?:[a:]{2})([a-zA-Z0-9]{16})|([a-zA-Z0-9]{16}))\/?(#.*)?$/
    );
  return match?.at(2);
};

export const isRegion = (x: string): x is Regions => {
  return orderedRegionsBySize.includes(x as Regions);
};
