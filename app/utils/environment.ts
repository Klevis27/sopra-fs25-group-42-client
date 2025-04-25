// eslint-disable no-process-env
// import process from "process";

export function isProduction(): boolean {
  // deno-lint-ignore no-process-globals
  return process.env.NODE_ENV === "production";
}
