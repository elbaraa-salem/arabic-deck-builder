import type { PreflightIssue } from "../types/preflight.ts";

export function formatPreflightIssue(issue: PreflightIssue): string {
  const label = issue.type.toUpperCase();

  const location = issue.path ? `${issue.path}: ` : "";

  return `[${label}] ${location}${issue.message}`;
}
