import { describe, expect, test } from "bun:test";

import { classifyChanges } from "./ci-changes.mjs";

describe("classifyChanges", () => {
  test("keeps documentation and Actions-only pull requests fast", () => {
    expect(classifyChanges(["docs/development.md", ".github/workflows/ci.yml"])).toEqual({
      integration: false,
      e2e: false,
      template: false,
      distribution: false,
      production: false,
      breaking: false,
      docker: false,
    });
  });

  test("selects application gates without unrelated packaging smokes", () => {
    expect(classifyChanges(["apps/api/app/Jobs/ProcessTask.php"])).toEqual({
      integration: true,
      e2e: true,
      template: false,
      distribution: false,
      production: true,
      breaking: false,
      docker: false,
    });
  });

  test("selects API compatibility when the HTTP contract changes", () => {
    expect(classifyChanges(["contracts/http/main.tsp"])).toEqual({
      integration: true,
      e2e: true,
      template: false,
      distribution: false,
      production: true,
      breaking: true,
      docker: false,
    });
  });

  test("scans production images when Docker automation changes", () => {
    expect(classifyChanges([".github/dependabot.yml"])).toEqual({
      integration: false,
      e2e: false,
      template: false,
      distribution: true,
      production: true,
      breaking: false,
      docker: true,
    });
  });

  test("rebuilds the distribution when a consumer asset changes", () => {
    expect(classifyChanges(["scripts/distribution/README.md"])).toEqual({
      integration: false,
      e2e: false,
      template: false,
      distribution: true,
      production: false,
      breaking: false,
      docker: false,
    });
  });

  test("rebuilds the distribution when its contract verifier changes", () => {
    expect(classifyChanges(["scripts/contracts-check.mjs"])).toMatchObject({ distribution: true });
  });

  test("rebuilds the distribution when its publisher changes", () => {
    expect(
      classifyChanges([
        ".github/workflows/publish-distribution.yml",
        "scripts/sync-distribution.sh",
      ]),
    ).toMatchObject({ distribution: true });
  });

  test("covers build context, archive and public entrypoint changes", () => {
    expect(classifyChanges([".dockerignore"])).toMatchObject({
      distribution: true,
      production: true,
      docker: true,
    });
    expect(classifyChanges([".gitignore"])).toMatchObject({
      template: true,
      distribution: true,
    });
    expect(classifyChanges(["apps/api/public/index.php"])).toMatchObject({
      integration: true,
      e2e: true,
      distribution: true,
      production: true,
    });
  });

  test("runs every gate for dependency graph changes and full events", () => {
    const expected = {
      integration: true,
      e2e: true,
      template: true,
      distribution: true,
      production: true,
      breaking: true,
      docker: true,
    };

    expect(classifyChanges(["bun.lock"])).toEqual(expected);
    expect(classifyChanges([], true)).toEqual(expected);
  });
});
