import { cyan, green, red, yellow } from "kleur/colors";

export const tags = {
  error: red("warcraftwogs:error"),
  warn: yellow("warcraftwogs:warn"),
  debug: green("warcraftwogs:debug"),
  info: cyan("warcraftwogs:info"),
};

export const info = (message: any, ...optionalParams: any[]) => {
  console.info(`${tags.info} ${message}`, ...optionalParams);
};
export const error = (message: any, ...optionalParams: any[]) => {
  console.error(`${tags.error} ${message}`, ...optionalParams);
};
export const warn = (message: any, ...optionalParams: any[]) => {
  console.log(`${tags.warn} ${message}`, ...optionalParams);
};
export const debug = (message: any, ...optionalParams: any[]) => {
  console.log(`${tags.debug} ${message}`, ...optionalParams);
};
