import { relative, resolve, sep } from "node:path";

// All manifest paths are relative to the invocation's working directory.
export function sourcePath(path: string): string {
  return relative(process.cwd(), resolve(path)).split(sep).join("/") || ".";
}
