import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

const openApiPath = fileURLToPath(
  new URL("../../../contracts/http/openapi/openapi.yaml", import.meta.url),
);
const outputPath = fileURLToPath(
  new URL("../src/generated/response-contracts.ts", import.meta.url),
);
const document = parse(readFileSync(openApiPath, "utf8"));
const imports = new Set();
const definitions = new Map();
const entries = [];

function pascal(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function routePattern(path) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replaceAll("/", "\\/");
  return `^${escaped.replace(/\\\{[^}]+\\\}/g, "[^/]+")}$`;
}

function dereference(schema) {
  if (typeof schema?.$ref !== "string") return schema;

  const name = schema.$ref.split("/").at(-1);
  return document.components.schemas[name];
}

function zodExpression(input) {
  const schema = dereference(input);

  if (Array.isArray(schema.enum)) {
    return `zod.enum(${JSON.stringify(schema.enum)})`;
  }

  if (Array.isArray(schema.anyOf)) {
    return `zod.union([${schema.anyOf.map(zodExpression).join(", ")}])`;
  }

  if (schema.type === "string") {
    return schema.format === "date-time"
      ? 'zod.iso.datetime({ offset: true })'
      : "zod.string()";
  }

  if (schema.type === "integer") return "zod.number().int()";
  if (schema.type === "number") return "zod.number()";
  if (schema.type === "boolean") return "zod.boolean()";
  if (schema.type === "array") return `zod.array(${zodExpression(schema.items)})`;

  if (schema.type === "object") {
    const required = new Set(schema.required ?? []);
    const properties = Object.entries(schema.properties ?? {}).map(([name, property]) => {
      const expression = zodExpression(property);
      return `  ${JSON.stringify(name)}: ${required.has(name) ? expression : `${expression}.optional()`},`;
    });
    const object = `zod.object({\n${properties.join("\n")}\n})`;

    if (schema.additionalProperties === false) return `${object}.strict()`;
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      return `${object}.catchall(${zodExpression(schema.additionalProperties)})`;
    }

    return object;
  }

  throw new Error(`Unsupported response schema: ${JSON.stringify(schema)}`);
}

function schemaName(operationId, status, response) {
  const schema = Object.values(response.content ?? {})[0]?.schema;

  if (schema === undefined) return "EmptyResponse";

  if (Number(status) >= 200 && Number(status) < 300) {
    const name = `${pascal(operationId)}Response`;
    imports.add(name);
    return name;
  }

  const name = `${pascal(operationId)}Response${status}`;
  definitions.set(name, zodExpression(schema));
  return name;
}

for (const [path, pathItem] of Object.entries(document.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (typeof operation.operationId !== "string") continue;

    const statuses = Object.entries(operation.responses).map(
      ([status, response]) => `      ${status}: ${schemaName(operation.operationId, status, response)},`,
    );

    entries.push(`  {
    operationId: "${operation.operationId}",
    method: "${method.toUpperCase()}",
    path: /${routePattern(path)}/,
    responses: {
${statuses.join("\n")}
    },
  },`);
  }
}

const source = `/**
 * Generated from contracts/http/openapi/openapi.yaml.
 * Do not edit manually.
 */
import * as zod from "zod";

import {
${[...imports]
  .sort()
  .map((name) => `  ${name},`)
  .join("\n")}
} from "./zod";

const EmptyResponse = zod.undefined();
${[...definitions]
  .map(([name, expression]) => `const ${name} = ${expression};`)
  .join("\n")}

export const responseContracts = [
${entries.join("\n")}
] as const;
`;

writeFileSync(outputPath, source);
console.log(`Generated HTTP response contracts: ${outputPath}`);
