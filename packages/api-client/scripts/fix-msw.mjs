import { readFileSync, writeFileSync } from "node:fs";

// Workaround for orval emitting faker.number.int({min: undefined, max: undefined}),
// which exactOptionalPropertyTypes rejects. Runs as an orval afterAllFilesWrite hook.
const files = process.argv.slice(2).filter((file) => file.endsWith(".msw.ts"));

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const fixed = source.replaceAll("{min: undefined, max: undefined}", "undefined");

  if (fixed !== source) {
    writeFileSync(file, fixed);
  }
}
