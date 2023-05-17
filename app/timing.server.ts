export type Timings = Record<
  string,
  { desc?: string; type: string; time: number }[]
>;

export const getServerTimeHeader = (timings: Timings): string => {
  return Object.entries(timings)
    .map(([key, timingInfos]) => {
      const dur = timingInfos
        .reduce((acc, timingInfo) => acc + timingInfo.time, 0)
        .toFixed(1);
      const desc = timingInfos
        .map((t) => t.desc)
        .filter(Boolean)
        .join(" & ");
      return [
        key.replace(/([ ,:;=@])/gu, "_"),
        desc ? `desc=${JSON.stringify(desc)}` : null,
        `dur=${dur}`,
      ]
        .filter(Boolean)
        .join(";");
    })
    .join(",");
};

export const time = async <ReturnType>(
  fn: Promise<ReturnType> | (() => ReturnType | Promise<ReturnType>),
  {
    type,
    desc,
    timings,
  }: {
    type: string;
    desc?: string;
    timings?: Timings;
  }
): Promise<ReturnType> => {
  const start = performance.now();
  const promise = typeof fn === "function" ? fn() : fn;
  if (!timings) {
    return promise;
  }
  const result = await promise;
  let timingType = timings[type];
  if (!timingType) {
    // eslint-disable-next-line no-multi-assign
    timingType = timings[type] = [];
  }

  timingType.push({ desc, type, time: performance.now() - start });
  return result;
};
