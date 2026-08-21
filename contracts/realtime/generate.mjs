import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { DiagnosticSeverity, Parser, fromFile } from "@asyncapi/parser";

const workspace = fileURLToPath(new URL(".", import.meta.url));
const contractPath = fileURLToPath(new URL("./asyncapi.yaml", import.meta.url));
const outputPath = fileURLToPath(new URL("./generated", import.meta.url));

if (!outputPath.endsWith("/contracts/realtime/generated")) {
  throw new Error(`Refusing to clean unexpected generated path: ${outputPath}`);
}

rmSync(outputPath, { recursive: true, force: true });
mkdirSync(outputPath, { recursive: true });

execFileSync(
  "bunx",
  [
    "asyncapi",
    "generate",
    "models",
    "typescript",
    contractPath,
    "--output",
    outputPath,
    "--tsModelType",
    "interface",
    "--tsEnumType",
    "union",
    "--tsModuleSystem",
    "ESM",
    "--tsExportType",
    "named",
    "--tsIncludeComments",
    "--tsRawPropertyNames",
    "--no-interactive",
  ],
  {
    cwd: workspace,
    env: {
      ...process.env,
      NODE_CONFIG_ENV: "development",
      NODE_ENV: "development",
      SUPPRESS_NO_CONFIG_WARNING: "1",
    },
    stdio: "inherit",
  },
);

for (const file of readdirSync(outputPath).filter((name) => name.endsWith(".ts"))) {
  const path = `${outputPath}/${file}`;
  const source = readFileSync(path, "utf8").replace(
    /^export \{ ([A-Za-z0-9_]+) \};$/gm,
    "export type { $1 };",
  );
  writeFileSync(path, source);
}

const parser = new Parser();
const { document, diagnostics } = await fromFile(parser, contractPath).parse();
const errors = diagnostics.filter(({ severity }) => severity === DiagnosticSeverity.Error);

if (document === undefined || errors.length > 0) {
  throw new Error("AsyncAPI must be valid before conformance metadata can be generated.");
}

const parsed = document.json();
const message = parsed.components.messages.taskStatusChanged;
const channel = parsed.channels.taskStatus;

function removeParserMetadata(value) {
  if (Array.isArray(value)) return value.map(removeParserMetadata);

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("x-parser-"))
        .map(([key, item]) => [key, removeParserMetadata(item)]),
    );
  }

  return value;
}

writeFileSync(
  new URL("./generated/index.ts", import.meta.url),
  'export type { TaskState } from "./TaskState";\nexport type { TaskStatusChangedPayload } from "./TaskStatusChangedPayload";\n',
);
writeFileSync(
  new URL("./generated/task-status-changed.contract.json", import.meta.url),
  `${JSON.stringify(
    {
      channel: channel.address,
      event: message.name,
      payload: removeParserMetadata(message.payload),
    },
    null,
    2,
  )}\n`,
);

execFileSync("bunx", ["oxfmt", "--write", "generated"], {
  cwd: workspace,
  stdio: "inherit",
});

console.log(`Generated realtime artifacts: ${outputPath}`);
