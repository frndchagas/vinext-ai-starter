import { appendFileSync } from "node:fs";

const ALL_GATES = [
  "integration",
  "e2e",
  "template",
  "distribution",
  "production",
  "breaking",
  "docker",
];

const patterns = {
  integration: [
    /^apps\/api\/(app|bootstrap|config|database|routes|tests)\//,
    /^apps\/api\/composer\.(json|lock)$/,
    /^contracts\//,
  ],
  e2e: [
    /^apps\/web\//,
    /^apps\/api\/(app|bootstrap|config|database|routes)\//,
    /^apps\/api\/composer\.(json|lock)$/,
    /^contracts\//,
    /^packages\/api-client\//,
    /^compose\.yaml$/,
    /^infra\/caddy\//,
  ],
  template: [
    /^\.env\.example$/,
    /^apps\/api\/\.env\.example$/,
    /^apps\/api\/composer\.(json|lock)$/,
    /^compose\.yaml$/,
    /^infra\/caddy\//,
    /^scripts\/template-smoke\.sh$/,
  ],
  distribution: [
    /^apps\/api\/composer\.(json|lock)$/,
    /^infra\/docker\//,
    /^scripts\/(build-distribution\.mjs|distribution-smoke\.sh)$/,
  ],
  production: [
    /^\.github\/dependabot\.yml$/,
    /^\.env\.production\.example$/,
    /^apps\/api\/(app|bootstrap|config|database|routes)\//,
    /^apps\/api\/composer\.(json|lock)$/,
    /^apps\/web\//,
    /^compose\.(production|coolify)(\.local)?\.yaml$/,
    /^contracts\//,
    /^infra\/docker\//,
    /^packages\/api-client\//,
    /^scripts\/(postgres-|production-smoke|coolify-compose)/,
  ],
  breaking: [/^contracts\/http\//],
  docker: [
    /^\.github\/dependabot\.yml$/,
    /^\.env\.production\.example$/,
    /^compose\.(production|coolify)(\.local)?\.yaml$/,
    /^infra\/docker\//,
  ],
};

const globalPaths = [/^bun\.lock$/, /^package\.json$/];

export function classifyChanges(paths, forceFull = false) {
  const result = Object.fromEntries(ALL_GATES.map((gate) => [gate, forceFull]));

  for (const path of paths) {
    if (globalPaths.some((pattern) => pattern.test(path))) {
      for (const gate of ALL_GATES) result[gate] = true;
      continue;
    }

    for (const gate of ALL_GATES) {
      if (patterns[gate].some((pattern) => pattern.test(path))) result[gate] = true;
    }
  }

  return result;
}

function changedPaths(base, head) {
  const result = Bun.spawnSync(["git", "diff", "--name-only", base, head], {
    stdout: "pipe",
    stderr: "inherit",
  });

  if (result.exitCode !== 0) throw new Error(`git diff exited with ${result.exitCode}.`);

  return result.stdout
    .toString()
    .split("\n")
    .map((path) => path.trim())
    .filter(Boolean);
}

if (import.meta.main) {
  const forceFull = process.env.CI_FORCE_FULL === "true";
  const paths = forceFull ? [] : changedPaths(process.env.BASE_SHA, process.env.HEAD_SHA);
  const result = classifyChanges(paths, forceFull);
  const output = Object.entries(result)
    .map(([gate, enabled]) => `${gate}=${enabled}`)
    .join("\n");

  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${output}\n`);
  console.log(forceFull ? "Full CI requested." : `Changed paths:\n${paths.join("\n") || "(none)"}`);
  console.log(`Selected gates:\n${output}`);
}
