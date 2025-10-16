#!/usr/bin/env node
import { getMonorepoDirpath } from "get-monorepo-root";
import getStdin from "get-stdin";
import fs from "node:fs";
import path from "node:path";

const stdin = await getStdin();
if (!stdin.includes("// dprint-reexport")) {
  process.stdout.write(stdin);
  process.exit(0);
}

// Find the "// dprint-reexport" line
const fileLines = stdin.split("\n");
const dprintReexportLineIndex = fileLines.findIndex((line) =>
  line.startsWith("// dprint-reexport")
);
const dprintReexportEndLineIndex = fileLines.findIndex((line) =>
  line.startsWith("// dprint-reexport end")
);

if (dprintReexportLineIndex === -1) {
  process.stdout.write(stdin);
  process.exit(0);
}

const dprintReexportLine = fileLines[dprintReexportLineIndex];
const filepath = process.argv[2];
const pluginArgs = dprintReexportLine.split(" ");
const globPattern = pluginArgs[2];
const globfileType =
  pluginArgs.find((arg) => arg.startsWith("--type="))?.replace("--type=", "") ??
  "matches";
const moduleType =
  pluginArgs
    .find((arg) => arg.startsWith("--module="))
    ?.replace("--module=", "") ?? "module";

const monorepoDirpath = getMonorepoDirpath(filepath);
const dirpath = path.dirname(filepath);
let newFileLines = [];
if (moduleType === "module") {
  newFileLines.push(
    ...fileLines.slice(0, dprintReexportLineIndex),
    dprintReexportLine
  );
  const matchedFiles = fs.globSync(path.resolve(dirpath, globPattern));
  if (globfileType === "filepaths") {
    newFileLines.push("export default {");
  }

  for (const matchedFile of matchedFiles) {
    if (globfileType === "matches") {
      let importSpecifier = path.relative(dirpath, matchedFile);
      if (!importSpecifier.startsWith(".")) {
        importSpecifier = `./${importSpecifier}`;
      }

      newFileLines.push(`export * from ${JSON.stringify(importSpecifier)}`;);
    } else if (globfileType === "files") {
      newFileLines.push(
        `export * as ${JSON.stringify(
          path.relative(monorepoDirpath, matchedFile)
        )} from ${JSON.stringify(importSpecifier)};`
      );
    } else if (globfileType === "filepaths") {
      newFileLines.push(
        `${JSON.stringify(path.relative(monorepoDirpath, matchedFile))}: true,`
      );
    }
  }

  if (globfileType === "filepaths") {
    newFileLines.push("}");
  }

  newFileLines.push(...fileLines.slice(dprintReexportEndLineIndex));
} else {
  throw new Error("Only module type is supported for now");
}

let formattedFileLines = newFileLines.join("\n");

if (dprintReexportEndLineIndex !== -1) {
  formattedFileLines +=
    "\n" + fileLines.slice(dprintReexportEndLineIndex).join("\n");
}

process.stdout.write(formattedFileLines);
