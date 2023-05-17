export const isPresent = <T>(x: T | null | undefined): x is T => {
  return x !== null && x !== undefined && typeof x !== "undefined";
};
