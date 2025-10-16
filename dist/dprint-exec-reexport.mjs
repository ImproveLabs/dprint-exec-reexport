#!/usr/bin/env node
import fs from "fs";
import { fileURLToPath } from "url";
import fs$1 from "node:fs";
import path from "node:path";

//#region node_modules/get-monorepo-root/node_modules/pathe/dist/shared/pathe.ff20891b.mjs
const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
const sep = "/";
const delimiter = ":";
const normalize = function(path$2) {
	if (path$2.length === 0) return ".";
	path$2 = normalizeWindowsPath(path$2);
	const isUNCPath = path$2.match(_UNC_REGEX);
	const isPathAbsolute = isAbsolute(path$2);
	const trailingSeparator = path$2[path$2.length - 1] === "/";
	path$2 = normalizeString(path$2, !isPathAbsolute);
	if (path$2.length === 0) {
		if (isPathAbsolute) return "/";
		return trailingSeparator ? "./" : ".";
	}
	if (trailingSeparator) path$2 += "/";
	if (_DRIVE_LETTER_RE.test(path$2)) path$2 += "/";
	if (isUNCPath) {
		if (!isPathAbsolute) return `//./${path$2}`;
		return `//${path$2}`;
	}
	return isPathAbsolute && !isAbsolute(path$2) ? `/${path$2}` : path$2;
};
const join = function(...arguments_) {
	if (arguments_.length === 0) return ".";
	let joined;
	for (const argument of arguments_) if (argument && argument.length > 0) if (joined === void 0) joined = argument;
	else joined += `/${argument}`;
	if (joined === void 0) return ".";
	return normalize(joined.replace(/\/\/+/g, "/"));
};
function cwd() {
	if (typeof process !== "undefined" && typeof process.cwd === "function") return process.cwd().replace(/\\/g, "/");
	return "/";
}
const resolve = function(...arguments_) {
	arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
		const path$2 = index >= 0 ? arguments_[index] : cwd();
		if (!path$2 || path$2.length === 0) continue;
		resolvedPath = `${path$2}/${resolvedPath}`;
		resolvedAbsolute = isAbsolute(path$2);
	}
	resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
	if (resolvedAbsolute && !isAbsolute(resolvedPath)) return `/${resolvedPath}`;
	return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path$2, allowAboveRoot) {
	let res = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let char = null;
	for (let index = 0; index <= path$2.length; ++index) {
		if (index < path$2.length) char = path$2[index];
		else if (char === "/") break;
		else char = "/";
		if (char === "/") {
			if (lastSlash === index - 1 || dots === 1);
			else if (dots === 2) {
				if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf("/");
						if (lastSlashIndex === -1) {
							res = "";
							lastSegmentLength = 0;
						} else {
							res = res.slice(0, lastSlashIndex);
							lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
						}
						lastSlash = index;
						dots = 0;
						continue;
					} else if (res.length > 0) {
						res = "";
						lastSegmentLength = 0;
						lastSlash = index;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					res += res.length > 0 ? "/.." : "..";
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += `/${path$2.slice(lastSlash + 1, index)}`;
				else res = path$2.slice(lastSlash + 1, index);
				lastSegmentLength = index - lastSlash - 1;
			}
			lastSlash = index;
			dots = 0;
		} else if (char === "." && dots !== -1) ++dots;
		else dots = -1;
	}
	return res;
}
const isAbsolute = function(p) {
	return _IS_ABSOLUTE_RE.test(p);
};
const toNamespacedPath = function(p) {
	return normalizeWindowsPath(p);
};
const _EXTNAME_RE = /.(\.[^./]+)$/;
const extname = function(p) {
	const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
	return match && match[1] || "";
};
const relative = function(from, to) {
	const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
	const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
	if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) return _to.join("/");
	const _fromCopy = [..._from];
	for (const segment of _fromCopy) {
		if (_to[0] !== segment) break;
		_from.shift();
		_to.shift();
	}
	return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname = function(p) {
	const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
	if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) segments[0] += "/";
	return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
const format = function(p) {
	const segments = [
		p.root,
		p.dir,
		p.base ?? p.name + p.ext
	].filter(Boolean);
	return normalizeWindowsPath(p.root ? resolve(...segments) : segments.join("/"));
};
const basename = function(p, extension) {
	const lastSegment = normalizeWindowsPath(p).split("/").pop();
	return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const parse = function(p) {
	const root = normalizeWindowsPath(p).split("/").shift() || "/";
	const base = basename(p);
	const extension = extname(base);
	return {
		root,
		dir: dirname(p),
		base,
		ext: extension,
		name: base.slice(0, base.length - extension.length)
	};
};
const path$1 = {
	__proto__: null,
	basename,
	delimiter,
	dirname,
	extname,
	format,
	isAbsolute,
	join,
	normalize,
	normalizeString,
	parse,
	relative,
	resolve,
	sep,
	toNamespacedPath
};

//#endregion
//#region node_modules/get-monorepo-root/utils/monorepo.js
function getMonorepoDirpath(curDirectory = process.cwd()) {
	curDirectory = curDirectory.startsWith("file://") ? fileURLToPath(curDirectory) : curDirectory;
	if (fs.statSync(curDirectory).isFile()) curDirectory = path$1.dirname(curDirectory);
	let maybeRoot;
	while (curDirectory !== "/" && curDirectory !== ".") {
		if (fs.existsSync(path$1.join(curDirectory, "package.json"))) {
			const packageJson = JSON.parse(fs.readFileSync(path$1.join(curDirectory, "package.json"), "utf8"));
			if (packageJson.workspaces !== void 0 || packageJson.root) return curDirectory;
			else maybeRoot = curDirectory;
		} else {
			const pnpmWorkspaceExists = fs.existsSync(path$1.join(curDirectory, "pnpm-workspace.yaml"));
			if (fs.existsSync(path$1.join(curDirectory, "pnpm-lock.yaml"))) maybeRoot = curDirectory;
			if (pnpmWorkspaceExists) return curDirectory;
		}
		curDirectory = path$1.dirname(curDirectory);
	}
	return maybeRoot;
}

//#endregion
//#region node_modules/get-stdin/index.js
const { stdin: stdin$1 } = process;
async function getStdin() {
	let result = "";
	if (stdin$1.isTTY) return result;
	stdin$1.setEncoding("utf8");
	for await (const chunk of stdin$1) result += chunk;
	return result;
}
getStdin.buffer = async () => {
	const result = [];
	let length = 0;
	if (stdin$1.isTTY) return Buffer.concat([]);
	for await (const chunk of stdin$1) {
		result.push(chunk);
		length += chunk.length;
	}
	return Buffer.concat(result, length);
};

//#endregion
//#region bin/dprint-exec-reexport.js
const stdin = await getStdin();
if (!stdin.includes("// dprint-reexport")) {
	process.stdout.write(stdin);
	process.exit(0);
}
const fileLines = stdin.split("\n");
const dprintReexportLineIndex = fileLines.findIndex((line) => line.startsWith("// dprint-reexport"));
const dprintReexportEndLineIndex = fileLines.findIndex((line) => line.startsWith("// dprint-reexport end"));
if (dprintReexportLineIndex === -1) {
	process.stdout.write(stdin);
	process.exit(0);
}
const dprintReexportLine = fileLines[dprintReexportLineIndex];
const filepath = process.argv[2];
const pluginArgs = dprintReexportLine.split(" ");
const globPattern = pluginArgs[2];
const globfileType = pluginArgs.find((arg) => arg.startsWith("--type="))?.replace("--type=", "") ?? "matches";
const moduleType = pluginArgs.find((arg) => arg.startsWith("--module="))?.replace("--module=", "") ?? "module";
const monorepoDirpath = getMonorepoDirpath(filepath);
const dirpath = path.dirname(filepath);
let newFileLines = [];
if (moduleType === "module") {
	newFileLines.push(...fileLines.slice(0, dprintReexportLineIndex), dprintReexportLine);
	const matchedFiles = fs$1.globSync(path.resolve(dirpath, globPattern));
	if (globfileType === "filepaths") newFileLines.push("export default {");
	for (const matchedFile of matchedFiles) {
		let importSpecifier = path.relative(dirpath, matchedFile);
		if (globfileType === "matches") {
			if (!importSpecifier.startsWith(".")) importSpecifier = `./${importSpecifier}`;
			newFileLines.push(`export * from ${JSON.stringify(importSpecifier)};`);
		} else if (globfileType === "files") newFileLines.push(`export * as ${JSON.stringify(path.relative(monorepoDirpath, matchedFile))} from ${JSON.stringify(importSpecifier)};`);
		else if (globfileType === "filepaths") newFileLines.push(`${JSON.stringify(path.relative(monorepoDirpath, matchedFile))}: true,`);
	}
	if (globfileType === "filepaths") newFileLines.push("}");
	newFileLines.push(...fileLines.slice(dprintReexportEndLineIndex));
} else throw new Error("Only module type is supported for now");
let formattedFileLines = newFileLines.join("\n");
if (dprintReexportEndLineIndex !== -1) formattedFileLines += "\n" + fileLines.slice(dprintReexportEndLineIndex).join("\n");
process.stdout.write(formattedFileLines);

//#endregion
export {  };