#!/usr/bin/env node
import fs, { lstatSync, readdir, readdirSync, readlinkSync, realpathSync } from "fs";
import { fileURLToPath } from "url";
import { fileURLToPath as fileURLToPath$1 } from "node:url";
import { posix, win32 } from "node:path";
import * as actualFS from "node:fs";
import { lstat, readdir as readdir$1, readlink, realpath } from "node:fs/promises";
import { EventEmitter } from "node:events";
import Stream from "node:stream";
import { StringDecoder } from "node:string_decoder";

//#region node_modules/get-monorepo-root/node_modules/pathe/dist/shared/pathe.ff20891b.mjs
const _DRIVE_LETTER_START_RE$1 = /^[A-Za-z]:\//;
function normalizeWindowsPath$1(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE$1, (r) => r.toUpperCase());
}
const _UNC_REGEX$1 = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE$1 = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE$1 = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE$1 = /^\/([A-Za-z]:)?$/;
const sep$2 = "/";
const delimiter$1 = ":";
const normalize$2 = function(path$2) {
	if (path$2.length === 0) return ".";
	path$2 = normalizeWindowsPath$1(path$2);
	const isUNCPath = path$2.match(_UNC_REGEX$1);
	const isPathAbsolute = isAbsolute$1(path$2);
	const trailingSeparator = path$2[path$2.length - 1] === "/";
	path$2 = normalizeString$1(path$2, !isPathAbsolute);
	if (path$2.length === 0) {
		if (isPathAbsolute) return "/";
		return trailingSeparator ? "./" : ".";
	}
	if (trailingSeparator) path$2 += "/";
	if (_DRIVE_LETTER_RE$1.test(path$2)) path$2 += "/";
	if (isUNCPath) {
		if (!isPathAbsolute) return `//./${path$2}`;
		return `//${path$2}`;
	}
	return isPathAbsolute && !isAbsolute$1(path$2) ? `/${path$2}` : path$2;
};
const join$1 = function(...arguments_) {
	if (arguments_.length === 0) return ".";
	let joined;
	for (const argument of arguments_) if (argument && argument.length > 0) if (joined === void 0) joined = argument;
	else joined += `/${argument}`;
	if (joined === void 0) return ".";
	return normalize$2(joined.replace(/\/\/+/g, "/"));
};
function cwd$1() {
	if (typeof process !== "undefined" && typeof process.cwd === "function") return process.cwd().replace(/\\/g, "/");
	return "/";
}
const resolve$1 = function(...arguments_) {
	arguments_ = arguments_.map((argument) => normalizeWindowsPath$1(argument));
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
		const path$2 = index >= 0 ? arguments_[index] : cwd$1();
		if (!path$2 || path$2.length === 0) continue;
		resolvedPath = `${path$2}/${resolvedPath}`;
		resolvedAbsolute = isAbsolute$1(path$2);
	}
	resolvedPath = normalizeString$1(resolvedPath, !resolvedAbsolute);
	if (resolvedAbsolute && !isAbsolute$1(resolvedPath)) return `/${resolvedPath}`;
	return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString$1(path$2, allowAboveRoot) {
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
const isAbsolute$1 = function(p) {
	return _IS_ABSOLUTE_RE$1.test(p);
};
const toNamespacedPath$1 = function(p) {
	return normalizeWindowsPath$1(p);
};
const _EXTNAME_RE$1 = /.(\.[^./]+)$/;
const extname$1 = function(p) {
	const match$1 = _EXTNAME_RE$1.exec(normalizeWindowsPath$1(p));
	return match$1 && match$1[1] || "";
};
const relative$1 = function(from, to) {
	const _from = resolve$1(from).replace(_ROOT_FOLDER_RE$1, "$1").split("/");
	const _to = resolve$1(to).replace(_ROOT_FOLDER_RE$1, "$1").split("/");
	if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) return _to.join("/");
	const _fromCopy = [..._from];
	for (const segment of _fromCopy) {
		if (_to[0] !== segment) break;
		_from.shift();
		_to.shift();
	}
	return [..._from.map(() => ".."), ..._to].join("/");
};
const dirname$1 = function(p) {
	const segments = normalizeWindowsPath$1(p).replace(/\/$/, "").split("/").slice(0, -1);
	if (segments.length === 1 && _DRIVE_LETTER_RE$1.test(segments[0])) segments[0] += "/";
	return segments.join("/") || (isAbsolute$1(p) ? "/" : ".");
};
const format$1 = function(p) {
	const segments = [
		p.root,
		p.dir,
		p.base ?? p.name + p.ext
	].filter(Boolean);
	return normalizeWindowsPath$1(p.root ? resolve$1(...segments) : segments.join("/"));
};
const basename$1 = function(p, extension) {
	const lastSegment = normalizeWindowsPath$1(p).split("/").pop();
	return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const parse$1 = function(p) {
	const root = normalizeWindowsPath$1(p).split("/").shift() || "/";
	const base = basename$1(p);
	const extension = extname$1(base);
	return {
		root,
		dir: dirname$1(p),
		base,
		ext: extension,
		name: base.slice(0, base.length - extension.length)
	};
};
const path$1 = {
	__proto__: null,
	basename: basename$1,
	delimiter: delimiter$1,
	dirname: dirname$1,
	extname: extname$1,
	format: format$1,
	isAbsolute: isAbsolute$1,
	join: join$1,
	normalize: normalize$2,
	normalizeString: normalizeString$1,
	parse: parse$1,
	relative: relative$1,
	resolve: resolve$1,
	sep: sep$2,
	toNamespacedPath: toNamespacedPath$1
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
//#region node_modules/pathe/dist/shared/pathe.M-eThtNZ.mjs
let _lazyMatch = () => {
	var __lib__ = (() => {
		var m = Object.defineProperty, V = Object.getOwnPropertyDescriptor, G = Object.getOwnPropertyNames, T = Object.prototype.hasOwnProperty, q = (r, e) => {
			for (var n in e) m(r, n, {
				get: e[n],
				enumerable: true
			});
		}, H = (r, e, n, a) => {
			if (e && typeof e == "object" || typeof e == "function") for (let t of G(e)) !T.call(r, t) && t !== n && m(r, t, {
				get: () => e[t],
				enumerable: !(a = V(e, t)) || a.enumerable
			});
			return r;
		}, J = (r) => H(m({}, "__esModule", { value: true }), r), w = {};
		q(w, { default: () => re });
		var A = (r) => Array.isArray(r), d = (r) => typeof r == "function", Q = (r) => r.length === 0, W = (r) => typeof r == "number", K = (r) => typeof r == "object" && r !== null, X = (r) => r instanceof RegExp, b = (r) => typeof r == "string", h = (r) => r === void 0, Y = (r) => {
			const e = /* @__PURE__ */ new Map();
			return (n) => {
				const a = e.get(n);
				if (a) return a;
				const t = r(n);
				return e.set(n, t), t;
			};
		}, rr = (r, e, n = {}) => {
			const a = {
				cache: {},
				input: r,
				index: 0,
				indexMax: 0,
				options: n,
				output: []
			};
			if (v(e)(a) && a.index === r.length) return a.output;
			throw new Error(`Failed to parse at index ${a.indexMax}`);
		}, i = (r, e) => A(r) ? er(r, e) : b(r) ? ar(r, e) : nr(r, e), er = (r, e) => {
			const n = {};
			for (const a of r) {
				if (a.length !== 1) throw new Error(`Invalid character: "${a}"`);
				const t = a.charCodeAt(0);
				n[t] = true;
			}
			return (a) => {
				const t = a.index, o = a.input;
				for (; a.index < o.length && o.charCodeAt(a.index) in n;) a.index += 1;
				const u = a.index;
				if (u > t) {
					if (!h(e) && !a.options.silent) {
						const s = a.input.slice(t, u), c = d(e) ? e(s, o, String(t)) : e;
						h(c) || a.output.push(c);
					}
					a.indexMax = Math.max(a.indexMax, a.index);
				}
				return true;
			};
		}, nr = (r, e) => {
			const n = r.source, a = r.flags.replace(/y|$/, "y"), t = new RegExp(n, a);
			return g((o) => {
				t.lastIndex = o.index;
				const u = t.exec(o.input);
				if (u) {
					if (!h(e) && !o.options.silent) {
						const s = d(e) ? e(...u, o.input, String(o.index)) : e;
						h(s) || o.output.push(s);
					}
					return o.index += u[0].length, o.indexMax = Math.max(o.indexMax, o.index), true;
				} else return false;
			});
		}, ar = (r, e) => (n) => {
			if (n.input.startsWith(r, n.index)) {
				if (!h(e) && !n.options.silent) {
					const t = d(e) ? e(r, n.input, String(n.index)) : e;
					h(t) || n.output.push(t);
				}
				return n.index += r.length, n.indexMax = Math.max(n.indexMax, n.index), true;
			} else return false;
		}, C = (r, e, n, a) => {
			const t = v(r);
			return g(_(M((o) => {
				let u = 0;
				for (; u < n;) {
					const s = o.index;
					if (!t(o) || (u += 1, o.index === s)) break;
				}
				return u >= e;
			})));
		}, tr = (r, e) => C(r, 0, 1), f = (r, e) => C(r, 0, Infinity), x = (r, e) => {
			const n = r.map(v);
			return g(_(M((a) => {
				for (let t = 0, o = n.length; t < o; t++) if (!n[t](a)) return false;
				return true;
			})));
		}, l = (r, e) => {
			const n = r.map(v);
			return g(_((a) => {
				for (let t = 0, o = n.length; t < o; t++) if (n[t](a)) return true;
				return false;
			}));
		}, M = (r, e = false) => {
			const n = v(r);
			return (a) => {
				const t = a.index, o = a.output.length, u = n(a);
				return (!u || e) && (a.index = t, a.output.length !== o && (a.output.length = o)), u;
			};
		}, _ = (r, e) => {
			return v(r);
		}, g = (() => {
			let r = 0;
			return (e) => {
				const n = v(e), a = r += 1;
				return (t) => {
					var o;
					if (t.options.memoization === false) return n(t);
					const u = t.index, s = (o = t.cache)[a] || (o[a] = /* @__PURE__ */ new Map()), c = s.get(u);
					if (c === false) return false;
					if (W(c)) return t.index = c, true;
					if (c) return t.index = c.index, c.output?.length && t.output.push(...c.output), true;
					{
						const Z = t.output.length;
						if (n(t)) {
							const D = t.index, U = t.output.length;
							if (U > Z) {
								const ee = t.output.slice(Z, U);
								s.set(u, {
									index: D,
									output: ee
								});
							} else s.set(u, D);
							return true;
						} else return s.set(u, false), false;
					}
				};
			};
		})(), E = (r) => {
			let e;
			return (n) => (e || (e = v(r())), e(n));
		}, v = Y((r) => {
			if (d(r)) return Q(r) ? E(r) : r;
			if (b(r) || X(r)) return i(r);
			if (A(r)) return x(r);
			if (K(r)) return l(Object.values(r));
			throw new Error("Invalid rule");
		}), P = "abcdefghijklmnopqrstuvwxyz", ir = (r) => {
			let e = "";
			for (; r > 0;) e = P[(r - 1) % 26] + e, r = Math.floor((r - 1) / 26);
			return e;
		}, O = (r) => {
			let e = 0;
			for (let n = 0, a = r.length; n < a; n++) e = e * 26 + P.indexOf(r[n]) + 1;
			return e;
		}, S = (r, e) => {
			if (e < r) return S(e, r);
			const n = [];
			for (; r <= e;) n.push(r++);
			return n;
		}, or = (r, e, n) => S(r, e).map((a) => String(a).padStart(n, "0")), R = (r, e) => S(O(r), O(e)).map(ir), p = (r) => r, z = (r) => ur((e) => rr(e, r, { memoization: false }).join("")), ur = (r) => {
			const e = {};
			return (n) => e[n] ?? (e[n] = r(n));
		}, sr = i(/^\*\*\/\*$/, ".*"), cr = i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]+)$/, (r, e, n) => `.*${e ? "" : "(?:^|/)"}${n.replaceAll(".", "\\.")}`), lr = i(/^\*\*\/(\*)?([ a-zA-Z0-9._-]*)\{([ a-zA-Z0-9._-]+(?:,[ a-zA-Z0-9._-]+)*)\}$/, (r, e, n, a) => `.*${e ? "" : "(?:^|/)"}${n.replaceAll(".", "\\.")}(?:${a.replaceAll(",", "|").replaceAll(".", "\\.")})`), y = i(/\\./, p), pr = i(/[$.*+?^(){}[\]\|]/, (r) => `\\${r}`), vr = i(/./, p), fr = l([i(/^(?:!!)*!(.*)$/, (r, e) => `(?!^${L(e)}$).*?`), i(/^(!!)+/, "")]), j = l([
			i(/\/(\*\*\/)+/, "(?:/.+/|/)"),
			i(/^(\*\*\/)+/, "(?:^|.*/)"),
			i(/\/(\*\*)$/, "(?:/.*|$)"),
			i(/\*\*/, ".*")
		]), N = l([i(/\*\/(?!\*\*\/)/, "[^/]*/"), i(/\*/, "[^/]*")]), k = i("?", "[^/]"), $r = i("[", p), wr = i("]", p), Ar = i(/[!^]/, "^/"), br = i(/[a-z]-[a-z]|[0-9]-[0-9]/i, p), Er = l([
			y,
			i(/[$.*+?^(){}[\|]/, (r) => `\\${r}`),
			br,
			i(/[^\]]/, p)
		]), B = x([
			$r,
			tr(Ar),
			f(Er),
			wr
		]), Pr = i("{", "(?:"), Or = i("}", ")"), I = x([
			Pr,
			l([
				i(/(\d+)\.\.(\d+)/, (r, e, n) => or(+e, +n, Math.min(e.length, n.length)).join("|")),
				i(/([a-z]+)\.\.([a-z]+)/, (r, e, n) => R(e, n).join("|")),
				i(/([A-Z]+)\.\.([A-Z]+)/, (r, e, n) => R(e.toLowerCase(), n.toLowerCase()).join("|").toUpperCase())
			]),
			Or
		]), kr = i("{", "(?:"), Br = i("}", ")"), Ir = i(",", "|"), Fr = i(/[$.*+?^(){[\]\|]/, (r) => `\\${r}`), Lr = i(/[^}]/, p), F = x([
			kr,
			f(l([
				j,
				N,
				k,
				B,
				I,
				E(() => F),
				y,
				Fr,
				Ir,
				Lr
			])),
			Br
		]), L = z(f(l([
			sr,
			cr,
			lr,
			fr,
			j,
			N,
			k,
			B,
			I,
			F,
			y,
			pr,
			vr
		]))), Tr = i(/\\./, p), qr = i(/./, p), Yr = z(f(l([
			Tr,
			i(/\*\*\*+/, "*"),
			i(/([^/{[(!])\*\*/, (r, e) => `${e}*`),
			i(/(^|.)\*\*(?=[^*/)\]}])/, (r, e) => `${e}*`),
			qr
		]))), $ = (r, e) => {
			const n = Array.isArray(r) ? r : [r];
			if (!n.length) return false;
			const a = n.map($.compile), t = n.every((s) => /(\/(?:\*\*)?|\[\/\])$/.test(s)), o = e.replace(/[\\\/]+/g, "/").replace(/\/$/, t ? "/" : "");
			return a.some((s) => s.test(o));
		};
		$.compile = (r) => new RegExp(`^${L(Yr(r))}$`, "s");
		var re = $;
		return J(w);
	})();
	return __lib__.default || __lib__;
};
let _match;
const zeptomatch = (path$2, pattern) => {
	if (!_match) {
		_match = _lazyMatch();
		_lazyMatch = null;
	}
	return _match(path$2, pattern);
};
const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
const _EXTNAME_RE = /.(\.[^./]+|\.)$/;
const _PATH_ROOT_RE = /^[/\\]|^[a-zA-Z]:[/\\]/;
const sep$1 = "/";
const normalize$1 = function(path$2) {
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
const join = function(...segments) {
	let path$2 = "";
	for (const seg of segments) {
		if (!seg) continue;
		if (path$2.length > 0) {
			const pathTrailing = path$2[path$2.length - 1] === "/";
			const segLeading = seg[0] === "/";
			if (pathTrailing && segLeading) path$2 += seg.slice(1);
			else path$2 += pathTrailing || segLeading ? seg : `/${seg}`;
		} else path$2 += seg;
	}
	return normalize$1(path$2);
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
const extname = function(p) {
	if (p === "..") return "";
	const match$1 = _EXTNAME_RE.exec(normalizeWindowsPath(p));
	return match$1 && match$1[1] || "";
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
	const ext$1 = p.ext ? p.ext.startsWith(".") ? p.ext : `.${p.ext}` : "";
	const segments = [
		p.root,
		p.dir,
		p.base ?? (p.name ?? "") + ext$1
	].filter(Boolean);
	return normalizeWindowsPath(p.root ? resolve(...segments) : segments.join("/"));
};
const basename = function(p, extension) {
	const segments = normalizeWindowsPath(p).split("/");
	let lastSegment = "";
	for (let i = segments.length - 1; i >= 0; i--) {
		const val = segments[i];
		if (val) {
			lastSegment = val;
			break;
		}
	}
	return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
const parse = function(p) {
	const root = _PATH_ROOT_RE.exec(p)?.[0]?.replace(/\\/g, "/") || "";
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
const matchesGlob = (path$2, pattern) => {
	return zeptomatch(pattern, normalize$1(path$2));
};
const _path = {
	__proto__: null,
	basename,
	dirname,
	extname,
	format,
	isAbsolute,
	join,
	matchesGlob,
	normalize: normalize$1,
	normalizeString,
	parse,
	relative,
	resolve,
	sep: sep$1,
	toNamespacedPath
};

//#endregion
//#region node_modules/pathe/dist/index.mjs
const delimiter = /* @__PURE__ */ (() => globalThis.process?.platform === "win32" ? ";" : ":")();
const _platforms = {
	posix: void 0,
	win32: void 0
};
const mix = (del = delimiter) => {
	return new Proxy(_path, { get(_, prop) {
		if (prop === "delimiter") return del;
		if (prop === "posix") return posix$1;
		if (prop === "win32") return win32$1;
		return _platforms[prop] || _path[prop];
	} });
};
const posix$1 = /* @__PURE__ */ mix(":");
const win32$1 = /* @__PURE__ */ mix(";");

//#endregion
//#region node_modules/@isaacs/balanced-match/dist/esm/index.js
const balanced = (a, b, str) => {
	const ma = a instanceof RegExp ? maybeMatch(a, str) : a;
	const mb = b instanceof RegExp ? maybeMatch(b, str) : b;
	const r = ma !== null && mb != null && range(ma, mb, str);
	return r && {
		start: r[0],
		end: r[1],
		pre: str.slice(0, r[0]),
		body: str.slice(r[0] + ma.length, r[1]),
		post: str.slice(r[1] + mb.length)
	};
};
const maybeMatch = (reg, str) => {
	const m = str.match(reg);
	return m ? m[0] : null;
};
const range = (a, b, str) => {
	let begs, beg, left, right = void 0, result;
	let ai = str.indexOf(a);
	let bi = str.indexOf(b, ai + 1);
	let i = ai;
	if (ai >= 0 && bi > 0) {
		if (a === b) return [ai, bi];
		begs = [];
		left = str.length;
		while (i >= 0 && !result) {
			if (i === ai) {
				begs.push(i);
				ai = str.indexOf(a, i + 1);
			} else if (begs.length === 1) {
				const r = begs.pop();
				if (r !== void 0) result = [r, bi];
			} else {
				beg = begs.pop();
				if (beg !== void 0 && beg < left) {
					left = beg;
					right = bi;
				}
				bi = str.indexOf(b, i + 1);
			}
			i = ai < bi && ai >= 0 ? ai : bi;
		}
		if (begs.length && right !== void 0) result = [left, right];
	}
	return result;
};

//#endregion
//#region node_modules/@isaacs/brace-expansion/dist/esm/index.js
const escSlash = "\0SLASH" + Math.random() + "\0";
const escOpen = "\0OPEN" + Math.random() + "\0";
const escClose = "\0CLOSE" + Math.random() + "\0";
const escComma = "\0COMMA" + Math.random() + "\0";
const escPeriod = "\0PERIOD" + Math.random() + "\0";
const escSlashPattern = new RegExp(escSlash, "g");
const escOpenPattern = new RegExp(escOpen, "g");
const escClosePattern = new RegExp(escClose, "g");
const escCommaPattern = new RegExp(escComma, "g");
const escPeriodPattern = new RegExp(escPeriod, "g");
const slashPattern = /\\\\/g;
const openPattern = /\\{/g;
const closePattern = /\\}/g;
const commaPattern = /\\,/g;
const periodPattern = /\\./g;
function numeric(str) {
	return !isNaN(str) ? parseInt(str, 10) : str.charCodeAt(0);
}
function escapeBraces(str) {
	return str.replace(slashPattern, escSlash).replace(openPattern, escOpen).replace(closePattern, escClose).replace(commaPattern, escComma).replace(periodPattern, escPeriod);
}
function unescapeBraces(str) {
	return str.replace(escSlashPattern, "\\").replace(escOpenPattern, "{").replace(escClosePattern, "}").replace(escCommaPattern, ",").replace(escPeriodPattern, ".");
}
/**
* Basically just str.split(","), but handling cases
* where we have nested braced sections, which should be
* treated as individual members, like {a,{b,c},d}
*/
function parseCommaParts(str) {
	if (!str) return [""];
	const parts = [];
	const m = balanced("{", "}", str);
	if (!m) return str.split(",");
	const { pre, body, post } = m;
	const p = pre.split(",");
	p[p.length - 1] += "{" + body + "}";
	const postParts = parseCommaParts(post);
	if (post.length) {
		p[p.length - 1] += postParts.shift();
		p.push.apply(p, postParts);
	}
	parts.push.apply(parts, p);
	return parts;
}
function expand(str) {
	if (!str) return [];
	if (str.slice(0, 2) === "{}") str = "\\{\\}" + str.slice(2);
	return expand_(escapeBraces(str), true).map(unescapeBraces);
}
function embrace(str) {
	return "{" + str + "}";
}
function isPadded(el) {
	return /^-?0\d/.test(el);
}
function lte(i, y) {
	return i <= y;
}
function gte(i, y) {
	return i >= y;
}
function expand_(str, isTop) {
	/** @type {string[]} */
	const expansions = [];
	const m = balanced("{", "}", str);
	if (!m) return [str];
	const pre = m.pre;
	const post = m.post.length ? expand_(m.post, false) : [""];
	if (/\$$/.test(m.pre)) for (let k = 0; k < post.length; k++) {
		const expansion = pre + "{" + m.body + "}" + post[k];
		expansions.push(expansion);
	}
	else {
		const isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
		const isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
		const isSequence = isNumericSequence || isAlphaSequence;
		const isOptions = m.body.indexOf(",") >= 0;
		if (!isSequence && !isOptions) {
			if (m.post.match(/,(?!,).*\}/)) {
				str = m.pre + "{" + m.body + escClose + m.post;
				return expand_(str);
			}
			return [str];
		}
		let n;
		if (isSequence) n = m.body.split(/\.\./);
		else {
			n = parseCommaParts(m.body);
			if (n.length === 1 && n[0] !== void 0) {
				n = expand_(n[0], false).map(embrace);
				/* c8 ignore start */
				if (n.length === 1) return post.map((p) => m.pre + n[0] + p);
			}
		}
		let N;
		if (isSequence && n[0] !== void 0 && n[1] !== void 0) {
			const x = numeric(n[0]);
			const y = numeric(n[1]);
			const width = Math.max(n[0].length, n[1].length);
			let incr = n.length === 3 && n[2] !== void 0 ? Math.abs(numeric(n[2])) : 1;
			let test = lte;
			if (y < x) {
				incr *= -1;
				test = gte;
			}
			const pad = n.some(isPadded);
			N = [];
			for (let i = x; test(i, y); i += incr) {
				let c;
				if (isAlphaSequence) {
					c = String.fromCharCode(i);
					if (c === "\\") c = "";
				} else {
					c = String(i);
					if (pad) {
						const need = width - c.length;
						if (need > 0) {
							const z = new Array(need + 1).join("0");
							if (i < 0) c = "-" + z + c.slice(1);
							else c = z + c;
						}
					}
				}
				N.push(c);
			}
		} else {
			N = [];
			for (let j = 0; j < n.length; j++) N.push.apply(N, expand_(n[j], false));
		}
		for (let j = 0; j < N.length; j++) for (let k = 0; k < post.length; k++) {
			const expansion = pre + N[j] + post[k];
			if (!isTop || isSequence || expansion) expansions.push(expansion);
		}
	}
	return expansions;
}

//#endregion
//#region node_modules/minimatch/dist/esm/assert-valid-pattern.js
const MAX_PATTERN_LENGTH = 1024 * 64;
const assertValidPattern = (pattern) => {
	if (typeof pattern !== "string") throw new TypeError("invalid pattern");
	if (pattern.length > MAX_PATTERN_LENGTH) throw new TypeError("pattern is too long");
};

//#endregion
//#region node_modules/minimatch/dist/esm/brace-expressions.js
const posixClasses = {
	"[:alnum:]": ["\\p{L}\\p{Nl}\\p{Nd}", true],
	"[:alpha:]": ["\\p{L}\\p{Nl}", true],
	"[:ascii:]": ["\\x00-\\x7f", false],
	"[:blank:]": ["\\p{Zs}\\t", true],
	"[:cntrl:]": ["\\p{Cc}", true],
	"[:digit:]": ["\\p{Nd}", true],
	"[:graph:]": [
		"\\p{Z}\\p{C}",
		true,
		true
	],
	"[:lower:]": ["\\p{Ll}", true],
	"[:print:]": ["\\p{C}", true],
	"[:punct:]": ["\\p{P}", true],
	"[:space:]": ["\\p{Z}\\t\\r\\n\\v\\f", true],
	"[:upper:]": ["\\p{Lu}", true],
	"[:word:]": ["\\p{L}\\p{Nl}\\p{Nd}\\p{Pc}", true],
	"[:xdigit:]": ["A-Fa-f0-9", false]
};
const braceEscape = (s) => s.replace(/[[\]\\-]/g, "\\$&");
const regexpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
const rangesToString = (ranges) => ranges.join("");
const parseClass = (glob$1, position) => {
	const pos = position;
	/* c8 ignore start */
	if (glob$1.charAt(pos) !== "[") throw new Error("not in a brace expression");
	/* c8 ignore stop */
	const ranges = [];
	const negs = [];
	let i = pos + 1;
	let sawStart = false;
	let uflag = false;
	let escaping = false;
	let negate = false;
	let endPos = pos;
	let rangeStart = "";
	WHILE: while (i < glob$1.length) {
		const c = glob$1.charAt(i);
		if ((c === "!" || c === "^") && i === pos + 1) {
			negate = true;
			i++;
			continue;
		}
		if (c === "]" && sawStart && !escaping) {
			endPos = i + 1;
			break;
		}
		sawStart = true;
		if (c === "\\") {
			if (!escaping) {
				escaping = true;
				i++;
				continue;
			}
		}
		if (c === "[" && !escaping) {
			for (const [cls, [unip, u, neg]] of Object.entries(posixClasses)) if (glob$1.startsWith(cls, i)) {
				if (rangeStart) return [
					"$.",
					false,
					glob$1.length - pos,
					true
				];
				i += cls.length;
				if (neg) negs.push(unip);
				else ranges.push(unip);
				uflag = uflag || u;
				continue WHILE;
			}
		}
		escaping = false;
		if (rangeStart) {
			if (c > rangeStart) ranges.push(braceEscape(rangeStart) + "-" + braceEscape(c));
			else if (c === rangeStart) ranges.push(braceEscape(c));
			rangeStart = "";
			i++;
			continue;
		}
		if (glob$1.startsWith("-]", i + 1)) {
			ranges.push(braceEscape(c + "-"));
			i += 2;
			continue;
		}
		if (glob$1.startsWith("-", i + 1)) {
			rangeStart = c;
			i += 2;
			continue;
		}
		ranges.push(braceEscape(c));
		i++;
	}
	if (endPos < i) return [
		"",
		false,
		0,
		false
	];
	if (!ranges.length && !negs.length) return [
		"$.",
		false,
		glob$1.length - pos,
		true
	];
	if (negs.length === 0 && ranges.length === 1 && /^\\?.$/.test(ranges[0]) && !negate) return [
		regexpEscape(ranges[0].length === 2 ? ranges[0].slice(-1) : ranges[0]),
		false,
		endPos - pos,
		false
	];
	const sranges = "[" + (negate ? "^" : "") + rangesToString(ranges) + "]";
	const snegs = "[" + (negate ? "" : "^") + rangesToString(negs) + "]";
	return [
		ranges.length && negs.length ? "(" + sranges + "|" + snegs + ")" : ranges.length ? sranges : snegs,
		uflag,
		endPos - pos,
		true
	];
};

//#endregion
//#region node_modules/minimatch/dist/esm/unescape.js
/**
* Un-escape a string that has been escaped with {@link escape}.
*
* If the {@link windowsPathsNoEscape} option is used, then square-brace
* escapes are removed, but not backslash escapes.  For example, it will turn
* the string `'[*]'` into `*`, but it will not turn `'\\*'` into `'*'`,
* becuase `\` is a path separator in `windowsPathsNoEscape` mode.
*
* When `windowsPathsNoEscape` is not set, then both brace escapes and
* backslash escapes are removed.
*
* Slashes (and backslashes in `windowsPathsNoEscape` mode) cannot be escaped
* or unescaped.
*/
const unescape = (s, { windowsPathsNoEscape = false } = {}) => {
	return windowsPathsNoEscape ? s.replace(/\[([^\/\\])\]/g, "$1") : s.replace(/((?!\\).|^)\[([^\/\\])\]/g, "$1$2").replace(/\\([^\/])/g, "$1");
};

//#endregion
//#region node_modules/minimatch/dist/esm/ast.js
const types = new Set([
	"!",
	"?",
	"+",
	"*",
	"@"
]);
const isExtglobType = (c) => types.has(c);
const startNoTraversal = "(?!(?:^|/)\\.\\.?(?:$|/))";
const startNoDot = "(?!\\.)";
const addPatternStart = new Set(["[", "."]);
const justDots = new Set(["..", "."]);
const reSpecials = /* @__PURE__ */ new Set("().*{}+?[]^$\\!");
const regExpEscape$1 = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
const qmark = "[^/]";
const star$1 = qmark + "*?";
const starNoEmpty = qmark + "+?";
var AST = class AST {
	type;
	#root;
	#hasMagic;
	#uflag = false;
	#parts = [];
	#parent;
	#parentIndex;
	#negs;
	#filledNegs = false;
	#options;
	#toString;
	#emptyExt = false;
	constructor(type, parent, options = {}) {
		this.type = type;
		if (type) this.#hasMagic = true;
		this.#parent = parent;
		this.#root = this.#parent ? this.#parent.#root : this;
		this.#options = this.#root === this ? options : this.#root.#options;
		this.#negs = this.#root === this ? [] : this.#root.#negs;
		if (type === "!" && !this.#root.#filledNegs) this.#negs.push(this);
		this.#parentIndex = this.#parent ? this.#parent.#parts.length : 0;
	}
	get hasMagic() {
		/* c8 ignore start */
		if (this.#hasMagic !== void 0) return this.#hasMagic;
		/* c8 ignore stop */
		for (const p of this.#parts) {
			if (typeof p === "string") continue;
			if (p.type || p.hasMagic) return this.#hasMagic = true;
		}
		return this.#hasMagic;
	}
	toString() {
		if (this.#toString !== void 0) return this.#toString;
		if (!this.type) return this.#toString = this.#parts.map((p) => String(p)).join("");
		else return this.#toString = this.type + "(" + this.#parts.map((p) => String(p)).join("|") + ")";
	}
	#fillNegs() {
		/* c8 ignore start */
		if (this !== this.#root) throw new Error("should only call on root");
		if (this.#filledNegs) return this;
		/* c8 ignore stop */
		this.toString();
		this.#filledNegs = true;
		let n;
		while (n = this.#negs.pop()) {
			if (n.type !== "!") continue;
			let p = n;
			let pp = p.#parent;
			while (pp) {
				for (let i = p.#parentIndex + 1; !pp.type && i < pp.#parts.length; i++) for (const part of n.#parts) {
					/* c8 ignore start */
					if (typeof part === "string") throw new Error("string part in extglob AST??");
					/* c8 ignore stop */
					part.copyIn(pp.#parts[i]);
				}
				p = pp;
				pp = p.#parent;
			}
		}
		return this;
	}
	push(...parts) {
		for (const p of parts) {
			if (p === "") continue;
			/* c8 ignore start */
			if (typeof p !== "string" && !(p instanceof AST && p.#parent === this)) throw new Error("invalid part: " + p);
			/* c8 ignore stop */
			this.#parts.push(p);
		}
	}
	toJSON() {
		const ret = this.type === null ? this.#parts.slice().map((p) => typeof p === "string" ? p : p.toJSON()) : [this.type, ...this.#parts.map((p) => p.toJSON())];
		if (this.isStart() && !this.type) ret.unshift([]);
		if (this.isEnd() && (this === this.#root || this.#root.#filledNegs && this.#parent?.type === "!")) ret.push({});
		return ret;
	}
	isStart() {
		if (this.#root === this) return true;
		if (!this.#parent?.isStart()) return false;
		if (this.#parentIndex === 0) return true;
		const p = this.#parent;
		for (let i = 0; i < this.#parentIndex; i++) {
			const pp = p.#parts[i];
			if (!(pp instanceof AST && pp.type === "!")) return false;
		}
		return true;
	}
	isEnd() {
		if (this.#root === this) return true;
		if (this.#parent?.type === "!") return true;
		if (!this.#parent?.isEnd()) return false;
		if (!this.type) return this.#parent?.isEnd();
		/* c8 ignore start */
		const pl = this.#parent ? this.#parent.#parts.length : 0;
		/* c8 ignore stop */
		return this.#parentIndex === pl - 1;
	}
	copyIn(part) {
		if (typeof part === "string") this.push(part);
		else this.push(part.clone(this));
	}
	clone(parent) {
		const c = new AST(this.type, parent);
		for (const p of this.#parts) c.copyIn(p);
		return c;
	}
	static #parseAST(str, ast, pos, opt) {
		let escaping = false;
		let inBrace = false;
		let braceStart = -1;
		let braceNeg = false;
		if (ast.type === null) {
			let i$1 = pos;
			let acc$1 = "";
			while (i$1 < str.length) {
				const c = str.charAt(i$1++);
				if (escaping || c === "\\") {
					escaping = !escaping;
					acc$1 += c;
					continue;
				}
				if (inBrace) {
					if (i$1 === braceStart + 1) {
						if (c === "^" || c === "!") braceNeg = true;
					} else if (c === "]" && !(i$1 === braceStart + 2 && braceNeg)) inBrace = false;
					acc$1 += c;
					continue;
				} else if (c === "[") {
					inBrace = true;
					braceStart = i$1;
					braceNeg = false;
					acc$1 += c;
					continue;
				}
				if (!opt.noext && isExtglobType(c) && str.charAt(i$1) === "(") {
					ast.push(acc$1);
					acc$1 = "";
					const ext$1 = new AST(c, ast);
					i$1 = AST.#parseAST(str, ext$1, i$1, opt);
					ast.push(ext$1);
					continue;
				}
				acc$1 += c;
			}
			ast.push(acc$1);
			return i$1;
		}
		let i = pos + 1;
		let part = new AST(null, ast);
		const parts = [];
		let acc = "";
		while (i < str.length) {
			const c = str.charAt(i++);
			if (escaping || c === "\\") {
				escaping = !escaping;
				acc += c;
				continue;
			}
			if (inBrace) {
				if (i === braceStart + 1) {
					if (c === "^" || c === "!") braceNeg = true;
				} else if (c === "]" && !(i === braceStart + 2 && braceNeg)) inBrace = false;
				acc += c;
				continue;
			} else if (c === "[") {
				inBrace = true;
				braceStart = i;
				braceNeg = false;
				acc += c;
				continue;
			}
			if (isExtglobType(c) && str.charAt(i) === "(") {
				part.push(acc);
				acc = "";
				const ext$1 = new AST(c, part);
				part.push(ext$1);
				i = AST.#parseAST(str, ext$1, i, opt);
				continue;
			}
			if (c === "|") {
				part.push(acc);
				acc = "";
				parts.push(part);
				part = new AST(null, ast);
				continue;
			}
			if (c === ")") {
				if (acc === "" && ast.#parts.length === 0) ast.#emptyExt = true;
				part.push(acc);
				acc = "";
				ast.push(...parts, part);
				return i;
			}
			acc += c;
		}
		ast.type = null;
		ast.#hasMagic = void 0;
		ast.#parts = [str.substring(pos - 1)];
		return i;
	}
	static fromGlob(pattern, options = {}) {
		const ast = new AST(null, void 0, options);
		AST.#parseAST(pattern, ast, 0, options);
		return ast;
	}
	toMMPattern() {
		/* c8 ignore start */
		if (this !== this.#root) return this.#root.toMMPattern();
		/* c8 ignore stop */
		const glob$1 = this.toString();
		const [re, body, hasMagic$1, uflag] = this.toRegExpSource();
		if (!(hasMagic$1 || this.#hasMagic || this.#options.nocase && !this.#options.nocaseMagicOnly && glob$1.toUpperCase() !== glob$1.toLowerCase())) return body;
		const flags = (this.#options.nocase ? "i" : "") + (uflag ? "u" : "");
		return Object.assign(new RegExp(`^${re}$`, flags), {
			_src: re,
			_glob: glob$1
		});
	}
	get options() {
		return this.#options;
	}
	toRegExpSource(allowDot) {
		const dot = allowDot ?? !!this.#options.dot;
		if (this.#root === this) this.#fillNegs();
		if (!this.type) {
			const noEmpty = this.isStart() && this.isEnd();
			const src = this.#parts.map((p) => {
				const [re, _, hasMagic$1, uflag] = typeof p === "string" ? AST.#parseGlob(p, this.#hasMagic, noEmpty) : p.toRegExpSource(allowDot);
				this.#hasMagic = this.#hasMagic || hasMagic$1;
				this.#uflag = this.#uflag || uflag;
				return re;
			}).join("");
			let start$1 = "";
			if (this.isStart()) {
				if (typeof this.#parts[0] === "string") {
					if (!(this.#parts.length === 1 && justDots.has(this.#parts[0]))) {
						const aps = addPatternStart;
						const needNoTrav = dot && aps.has(src.charAt(0)) || src.startsWith("\\.") && aps.has(src.charAt(2)) || src.startsWith("\\.\\.") && aps.has(src.charAt(4));
						const needNoDot = !dot && !allowDot && aps.has(src.charAt(0));
						start$1 = needNoTrav ? startNoTraversal : needNoDot ? startNoDot : "";
					}
				}
			}
			let end = "";
			if (this.isEnd() && this.#root.#filledNegs && this.#parent?.type === "!") end = "(?:$|\\/)";
			return [
				start$1 + src + end,
				unescape(src),
				this.#hasMagic = !!this.#hasMagic,
				this.#uflag
			];
		}
		const repeated = this.type === "*" || this.type === "+";
		const start = this.type === "!" ? "(?:(?!(?:" : "(?:";
		let body = this.#partsToRegExp(dot);
		if (this.isStart() && this.isEnd() && !body && this.type !== "!") {
			const s = this.toString();
			this.#parts = [s];
			this.type = null;
			this.#hasMagic = void 0;
			return [
				s,
				unescape(this.toString()),
				false,
				false
			];
		}
		let bodyDotAllowed = !repeated || allowDot || dot || false ? "" : this.#partsToRegExp(true);
		if (bodyDotAllowed === body) bodyDotAllowed = "";
		if (bodyDotAllowed) body = `(?:${body})(?:${bodyDotAllowed})*?`;
		let final = "";
		if (this.type === "!" && this.#emptyExt) final = (this.isStart() && !dot ? startNoDot : "") + starNoEmpty;
		else {
			const close = this.type === "!" ? "))" + (this.isStart() && !dot && !allowDot ? startNoDot : "") + star$1 + ")" : this.type === "@" ? ")" : this.type === "?" ? ")?" : this.type === "+" && bodyDotAllowed ? ")" : this.type === "*" && bodyDotAllowed ? `)?` : `)${this.type}`;
			final = start + body + close;
		}
		return [
			final,
			unescape(body),
			this.#hasMagic = !!this.#hasMagic,
			this.#uflag
		];
	}
	#partsToRegExp(dot) {
		return this.#parts.map((p) => {
			/* c8 ignore start */
			if (typeof p === "string") throw new Error("string type in extglob ast??");
			/* c8 ignore stop */
			const [re, _, _hasMagic, uflag] = p.toRegExpSource(dot);
			this.#uflag = this.#uflag || uflag;
			return re;
		}).filter((p) => !(this.isStart() && this.isEnd()) || !!p).join("|");
	}
	static #parseGlob(glob$1, hasMagic$1, noEmpty = false) {
		let escaping = false;
		let re = "";
		let uflag = false;
		for (let i = 0; i < glob$1.length; i++) {
			const c = glob$1.charAt(i);
			if (escaping) {
				escaping = false;
				re += (reSpecials.has(c) ? "\\" : "") + c;
				continue;
			}
			if (c === "\\") {
				if (i === glob$1.length - 1) re += "\\\\";
				else escaping = true;
				continue;
			}
			if (c === "[") {
				const [src, needUflag, consumed, magic] = parseClass(glob$1, i);
				if (consumed) {
					re += src;
					uflag = uflag || needUflag;
					i += consumed - 1;
					hasMagic$1 = hasMagic$1 || magic;
					continue;
				}
			}
			if (c === "*") {
				if (noEmpty && glob$1 === "*") re += starNoEmpty;
				else re += star$1;
				hasMagic$1 = true;
				continue;
			}
			if (c === "?") {
				re += qmark;
				hasMagic$1 = true;
				continue;
			}
			re += regExpEscape$1(c);
		}
		return [
			re,
			unescape(glob$1),
			!!hasMagic$1,
			uflag
		];
	}
};

//#endregion
//#region node_modules/minimatch/dist/esm/escape.js
/**
* Escape all magic characters in a glob pattern.
*
* If the {@link windowsPathsNoEscape | GlobOptions.windowsPathsNoEscape}
* option is used, then characters are escaped by wrapping in `[]`, because
* a magic character wrapped in a character class can only be satisfied by
* that exact character.  In this mode, `\` is _not_ escaped, because it is
* not interpreted as a magic character, but instead as a path separator.
*/
const escape = (s, { windowsPathsNoEscape = false } = {}) => {
	return windowsPathsNoEscape ? s.replace(/[?*()[\]]/g, "[$&]") : s.replace(/[?*()[\]\\]/g, "\\$&");
};

//#endregion
//#region node_modules/minimatch/dist/esm/index.js
const minimatch = (p, pattern, options = {}) => {
	assertValidPattern(pattern);
	if (!options.nocomment && pattern.charAt(0) === "#") return false;
	return new Minimatch(pattern, options).match(p);
};
const starDotExtRE = /^\*+([^+@!?\*\[\(]*)$/;
const starDotExtTest = (ext$1) => (f) => !f.startsWith(".") && f.endsWith(ext$1);
const starDotExtTestDot = (ext$1) => (f) => f.endsWith(ext$1);
const starDotExtTestNocase = (ext$1) => {
	ext$1 = ext$1.toLowerCase();
	return (f) => !f.startsWith(".") && f.toLowerCase().endsWith(ext$1);
};
const starDotExtTestNocaseDot = (ext$1) => {
	ext$1 = ext$1.toLowerCase();
	return (f) => f.toLowerCase().endsWith(ext$1);
};
const starDotStarRE = /^\*+\.\*+$/;
const starDotStarTest = (f) => !f.startsWith(".") && f.includes(".");
const starDotStarTestDot = (f) => f !== "." && f !== ".." && f.includes(".");
const dotStarRE = /^\.\*+$/;
const dotStarTest = (f) => f !== "." && f !== ".." && f.startsWith(".");
const starRE = /^\*+$/;
const starTest = (f) => f.length !== 0 && !f.startsWith(".");
const starTestDot = (f) => f.length !== 0 && f !== "." && f !== "..";
const qmarksRE = /^\?+([^+@!?\*\[\(]*)?$/;
const qmarksTestNocase = ([$0, ext$1 = ""]) => {
	const noext = qmarksTestNoExt([$0]);
	if (!ext$1) return noext;
	ext$1 = ext$1.toLowerCase();
	return (f) => noext(f) && f.toLowerCase().endsWith(ext$1);
};
const qmarksTestNocaseDot = ([$0, ext$1 = ""]) => {
	const noext = qmarksTestNoExtDot([$0]);
	if (!ext$1) return noext;
	ext$1 = ext$1.toLowerCase();
	return (f) => noext(f) && f.toLowerCase().endsWith(ext$1);
};
const qmarksTestDot = ([$0, ext$1 = ""]) => {
	const noext = qmarksTestNoExtDot([$0]);
	return !ext$1 ? noext : (f) => noext(f) && f.endsWith(ext$1);
};
const qmarksTest = ([$0, ext$1 = ""]) => {
	const noext = qmarksTestNoExt([$0]);
	return !ext$1 ? noext : (f) => noext(f) && f.endsWith(ext$1);
};
const qmarksTestNoExt = ([$0]) => {
	const len = $0.length;
	return (f) => f.length === len && !f.startsWith(".");
};
const qmarksTestNoExtDot = ([$0]) => {
	const len = $0.length;
	return (f) => f.length === len && f !== "." && f !== "..";
};
/* c8 ignore start */
const defaultPlatform$2 = typeof process === "object" && process ? typeof process.env === "object" && process.env && process.env.__MINIMATCH_TESTING_PLATFORM__ || process.platform : "posix";
const path = {
	win32: { sep: "\\" },
	posix: { sep: "/" }
};
/* c8 ignore stop */
const sep = defaultPlatform$2 === "win32" ? path.win32.sep : path.posix.sep;
minimatch.sep = sep;
const GLOBSTAR = Symbol("globstar **");
minimatch.GLOBSTAR = GLOBSTAR;
const star = "[^/]*?";
const twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
const twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
const filter = (pattern, options = {}) => (p) => minimatch(p, pattern, options);
minimatch.filter = filter;
const ext = (a, b = {}) => Object.assign({}, a, b);
const defaults = (def) => {
	if (!def || typeof def !== "object" || !Object.keys(def).length) return minimatch;
	const orig = minimatch;
	const m = (p, pattern, options = {}) => orig(p, pattern, ext(def, options));
	return Object.assign(m, {
		Minimatch: class Minimatch$1 extends orig.Minimatch {
			constructor(pattern, options = {}) {
				super(pattern, ext(def, options));
			}
			static defaults(options) {
				return orig.defaults(ext(def, options)).Minimatch;
			}
		},
		AST: class AST$1 extends orig.AST {
			/* c8 ignore start */
			constructor(type, parent, options = {}) {
				super(type, parent, ext(def, options));
			}
			/* c8 ignore stop */
			static fromGlob(pattern, options = {}) {
				return orig.AST.fromGlob(pattern, ext(def, options));
			}
		},
		unescape: (s, options = {}) => orig.unescape(s, ext(def, options)),
		escape: (s, options = {}) => orig.escape(s, ext(def, options)),
		filter: (pattern, options = {}) => orig.filter(pattern, ext(def, options)),
		defaults: (options) => orig.defaults(ext(def, options)),
		makeRe: (pattern, options = {}) => orig.makeRe(pattern, ext(def, options)),
		braceExpand: (pattern, options = {}) => orig.braceExpand(pattern, ext(def, options)),
		match: (list, pattern, options = {}) => orig.match(list, pattern, ext(def, options)),
		sep: orig.sep,
		GLOBSTAR
	});
};
minimatch.defaults = defaults;
const braceExpand = (pattern, options = {}) => {
	assertValidPattern(pattern);
	if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) return [pattern];
	return expand(pattern);
};
minimatch.braceExpand = braceExpand;
const makeRe = (pattern, options = {}) => new Minimatch(pattern, options).makeRe();
minimatch.makeRe = makeRe;
const match = (list, pattern, options = {}) => {
	const mm = new Minimatch(pattern, options);
	list = list.filter((f) => mm.match(f));
	if (mm.options.nonull && !list.length) list.push(pattern);
	return list;
};
minimatch.match = match;
const globMagic = /[?*]|[+@!]\(.*?\)|\[|\]/;
const regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
var Minimatch = class {
	options;
	set;
	pattern;
	windowsPathsNoEscape;
	nonegate;
	negate;
	comment;
	empty;
	preserveMultipleSlashes;
	partial;
	globSet;
	globParts;
	nocase;
	isWindows;
	platform;
	windowsNoMagicRoot;
	regexp;
	constructor(pattern, options = {}) {
		assertValidPattern(pattern);
		options = options || {};
		this.options = options;
		this.pattern = pattern;
		this.platform = options.platform || defaultPlatform$2;
		this.isWindows = this.platform === "win32";
		this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
		if (this.windowsPathsNoEscape) this.pattern = this.pattern.replace(/\\/g, "/");
		this.preserveMultipleSlashes = !!options.preserveMultipleSlashes;
		this.regexp = null;
		this.negate = false;
		this.nonegate = !!options.nonegate;
		this.comment = false;
		this.empty = false;
		this.partial = !!options.partial;
		this.nocase = !!this.options.nocase;
		this.windowsNoMagicRoot = options.windowsNoMagicRoot !== void 0 ? options.windowsNoMagicRoot : !!(this.isWindows && this.nocase);
		this.globSet = [];
		this.globParts = [];
		this.set = [];
		this.make();
	}
	hasMagic() {
		if (this.options.magicalBraces && this.set.length > 1) return true;
		for (const pattern of this.set) for (const part of pattern) if (typeof part !== "string") return true;
		return false;
	}
	debug(..._) {}
	make() {
		const pattern = this.pattern;
		const options = this.options;
		if (!options.nocomment && pattern.charAt(0) === "#") {
			this.comment = true;
			return;
		}
		if (!pattern) {
			this.empty = true;
			return;
		}
		this.parseNegate();
		this.globSet = [...new Set(this.braceExpand())];
		if (options.debug) this.debug = (...args) => console.error(...args);
		this.debug(this.pattern, this.globSet);
		const rawGlobParts = this.globSet.map((s) => this.slashSplit(s));
		this.globParts = this.preprocess(rawGlobParts);
		this.debug(this.pattern, this.globParts);
		let set = this.globParts.map((s, _, __) => {
			if (this.isWindows && this.windowsNoMagicRoot) {
				const isUNC = s[0] === "" && s[1] === "" && (s[2] === "?" || !globMagic.test(s[2])) && !globMagic.test(s[3]);
				const isDrive = /^[a-z]:/i.test(s[0]);
				if (isUNC) return [...s.slice(0, 4), ...s.slice(4).map((ss) => this.parse(ss))];
				else if (isDrive) return [s[0], ...s.slice(1).map((ss) => this.parse(ss))];
			}
			return s.map((ss) => this.parse(ss));
		});
		this.debug(this.pattern, set);
		this.set = set.filter((s) => s.indexOf(false) === -1);
		if (this.isWindows) for (let i = 0; i < this.set.length; i++) {
			const p = this.set[i];
			if (p[0] === "" && p[1] === "" && this.globParts[i][2] === "?" && typeof p[3] === "string" && /^[a-z]:$/i.test(p[3])) p[2] = "?";
		}
		this.debug(this.pattern, this.set);
	}
	preprocess(globParts) {
		if (this.options.noglobstar) {
			for (let i = 0; i < globParts.length; i++) for (let j = 0; j < globParts[i].length; j++) if (globParts[i][j] === "**") globParts[i][j] = "*";
		}
		const { optimizationLevel = 1 } = this.options;
		if (optimizationLevel >= 2) {
			globParts = this.firstPhasePreProcess(globParts);
			globParts = this.secondPhasePreProcess(globParts);
		} else if (optimizationLevel >= 1) globParts = this.levelOneOptimize(globParts);
		else globParts = this.adjascentGlobstarOptimize(globParts);
		return globParts;
	}
	adjascentGlobstarOptimize(globParts) {
		return globParts.map((parts) => {
			let gs = -1;
			while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
				let i = gs;
				while (parts[i + 1] === "**") i++;
				if (i !== gs) parts.splice(gs, i - gs);
			}
			return parts;
		});
	}
	levelOneOptimize(globParts) {
		return globParts.map((parts) => {
			parts = parts.reduce((set, part) => {
				const prev = set[set.length - 1];
				if (part === "**" && prev === "**") return set;
				if (part === "..") {
					if (prev && prev !== ".." && prev !== "." && prev !== "**") {
						set.pop();
						return set;
					}
				}
				set.push(part);
				return set;
			}, []);
			return parts.length === 0 ? [""] : parts;
		});
	}
	levelTwoFileOptimize(parts) {
		if (!Array.isArray(parts)) parts = this.slashSplit(parts);
		let didSomething = false;
		do {
			didSomething = false;
			if (!this.preserveMultipleSlashes) {
				for (let i = 1; i < parts.length - 1; i++) {
					const p = parts[i];
					if (i === 1 && p === "" && parts[0] === "") continue;
					if (p === "." || p === "") {
						didSomething = true;
						parts.splice(i, 1);
						i--;
					}
				}
				if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
					didSomething = true;
					parts.pop();
				}
			}
			let dd = 0;
			while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
				const p = parts[dd - 1];
				if (p && p !== "." && p !== ".." && p !== "**") {
					didSomething = true;
					parts.splice(dd - 1, 2);
					dd -= 2;
				}
			}
		} while (didSomething);
		return parts.length === 0 ? [""] : parts;
	}
	firstPhasePreProcess(globParts) {
		let didSomething = false;
		do {
			didSomething = false;
			for (let parts of globParts) {
				let gs = -1;
				while (-1 !== (gs = parts.indexOf("**", gs + 1))) {
					let gss = gs;
					while (parts[gss + 1] === "**") gss++;
					if (gss > gs) parts.splice(gs + 1, gss - gs);
					let next = parts[gs + 1];
					const p = parts[gs + 2];
					const p2 = parts[gs + 3];
					if (next !== "..") continue;
					if (!p || p === "." || p === ".." || !p2 || p2 === "." || p2 === "..") continue;
					didSomething = true;
					parts.splice(gs, 1);
					const other = parts.slice(0);
					other[gs] = "**";
					globParts.push(other);
					gs--;
				}
				if (!this.preserveMultipleSlashes) {
					for (let i = 1; i < parts.length - 1; i++) {
						const p = parts[i];
						if (i === 1 && p === "" && parts[0] === "") continue;
						if (p === "." || p === "") {
							didSomething = true;
							parts.splice(i, 1);
							i--;
						}
					}
					if (parts[0] === "." && parts.length === 2 && (parts[1] === "." || parts[1] === "")) {
						didSomething = true;
						parts.pop();
					}
				}
				let dd = 0;
				while (-1 !== (dd = parts.indexOf("..", dd + 1))) {
					const p = parts[dd - 1];
					if (p && p !== "." && p !== ".." && p !== "**") {
						didSomething = true;
						const splin = dd === 1 && parts[dd + 1] === "**" ? ["."] : [];
						parts.splice(dd - 1, 2, ...splin);
						if (parts.length === 0) parts.push("");
						dd -= 2;
					}
				}
			}
		} while (didSomething);
		return globParts;
	}
	secondPhasePreProcess(globParts) {
		for (let i = 0; i < globParts.length - 1; i++) for (let j = i + 1; j < globParts.length; j++) {
			const matched = this.partsMatch(globParts[i], globParts[j], !this.preserveMultipleSlashes);
			if (matched) {
				globParts[i] = [];
				globParts[j] = matched;
				break;
			}
		}
		return globParts.filter((gs) => gs.length);
	}
	partsMatch(a, b, emptyGSMatch = false) {
		let ai = 0;
		let bi = 0;
		let result = [];
		let which = "";
		while (ai < a.length && bi < b.length) if (a[ai] === b[bi]) {
			result.push(which === "b" ? b[bi] : a[ai]);
			ai++;
			bi++;
		} else if (emptyGSMatch && a[ai] === "**" && b[bi] === a[ai + 1]) {
			result.push(a[ai]);
			ai++;
		} else if (emptyGSMatch && b[bi] === "**" && a[ai] === b[bi + 1]) {
			result.push(b[bi]);
			bi++;
		} else if (a[ai] === "*" && b[bi] && (this.options.dot || !b[bi].startsWith(".")) && b[bi] !== "**") {
			if (which === "b") return false;
			which = "a";
			result.push(a[ai]);
			ai++;
			bi++;
		} else if (b[bi] === "*" && a[ai] && (this.options.dot || !a[ai].startsWith(".")) && a[ai] !== "**") {
			if (which === "a") return false;
			which = "b";
			result.push(b[bi]);
			ai++;
			bi++;
		} else return false;
		return a.length === b.length && result;
	}
	parseNegate() {
		if (this.nonegate) return;
		const pattern = this.pattern;
		let negate = false;
		let negateOffset = 0;
		for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
			negate = !negate;
			negateOffset++;
		}
		if (negateOffset) this.pattern = pattern.slice(negateOffset);
		this.negate = negate;
	}
	matchOne(file, pattern, partial = false) {
		const options = this.options;
		if (this.isWindows) {
			const fileDrive = typeof file[0] === "string" && /^[a-z]:$/i.test(file[0]);
			const fileUNC = !fileDrive && file[0] === "" && file[1] === "" && file[2] === "?" && /^[a-z]:$/i.test(file[3]);
			const patternDrive = typeof pattern[0] === "string" && /^[a-z]:$/i.test(pattern[0]);
			const patternUNC = !patternDrive && pattern[0] === "" && pattern[1] === "" && pattern[2] === "?" && typeof pattern[3] === "string" && /^[a-z]:$/i.test(pattern[3]);
			const fdi = fileUNC ? 3 : fileDrive ? 0 : void 0;
			const pdi = patternUNC ? 3 : patternDrive ? 0 : void 0;
			if (typeof fdi === "number" && typeof pdi === "number") {
				const [fd, pd] = [file[fdi], pattern[pdi]];
				if (fd.toLowerCase() === pd.toLowerCase()) {
					pattern[pdi] = fd;
					if (pdi > fdi) pattern = pattern.slice(pdi);
					else if (fdi > pdi) file = file.slice(fdi);
				}
			}
		}
		const { optimizationLevel = 1 } = this.options;
		if (optimizationLevel >= 2) file = this.levelTwoFileOptimize(file);
		this.debug("matchOne", this, {
			file,
			pattern
		});
		this.debug("matchOne", file.length, pattern.length);
		for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
			this.debug("matchOne loop");
			var p = pattern[pi];
			var f = file[fi];
			this.debug(pattern, p, f);
			/* c8 ignore start */
			if (p === false) return false;
			/* c8 ignore stop */
			if (p === GLOBSTAR) {
				this.debug("GLOBSTAR", [
					pattern,
					p,
					f
				]);
				var fr = fi;
				var pr = pi + 1;
				if (pr === pl) {
					this.debug("** at the end");
					for (; fi < fl; fi++) if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".") return false;
					return true;
				}
				while (fr < fl) {
					var swallowee = file[fr];
					this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
					if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
						this.debug("globstar found match!", fr, fl, swallowee);
						return true;
					} else {
						if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
							this.debug("dot detected!", file, fr, pattern, pr);
							break;
						}
						this.debug("globstar swallow a segment, and continue");
						fr++;
					}
				}
				/* c8 ignore start */
				if (partial) {
					this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
					if (fr === fl) return true;
				}
				/* c8 ignore stop */
				return false;
			}
			let hit;
			if (typeof p === "string") {
				hit = f === p;
				this.debug("string match", p, f, hit);
			} else {
				hit = p.test(f);
				this.debug("pattern match", p, f, hit);
			}
			if (!hit) return false;
		}
		if (fi === fl && pi === pl) return true;
		else if (fi === fl) return partial;
		else if (pi === pl) return fi === fl - 1 && file[fi] === "";
		else throw new Error("wtf?");
		/* c8 ignore stop */
	}
	braceExpand() {
		return braceExpand(this.pattern, this.options);
	}
	parse(pattern) {
		assertValidPattern(pattern);
		const options = this.options;
		if (pattern === "**") return GLOBSTAR;
		if (pattern === "") return "";
		let m;
		let fastTest = null;
		if (m = pattern.match(starRE)) fastTest = options.dot ? starTestDot : starTest;
		else if (m = pattern.match(starDotExtRE)) fastTest = (options.nocase ? options.dot ? starDotExtTestNocaseDot : starDotExtTestNocase : options.dot ? starDotExtTestDot : starDotExtTest)(m[1]);
		else if (m = pattern.match(qmarksRE)) fastTest = (options.nocase ? options.dot ? qmarksTestNocaseDot : qmarksTestNocase : options.dot ? qmarksTestDot : qmarksTest)(m);
		else if (m = pattern.match(starDotStarRE)) fastTest = options.dot ? starDotStarTestDot : starDotStarTest;
		else if (m = pattern.match(dotStarRE)) fastTest = dotStarTest;
		const re = AST.fromGlob(pattern, this.options).toMMPattern();
		if (fastTest && typeof re === "object") Reflect.defineProperty(re, "test", { value: fastTest });
		return re;
	}
	makeRe() {
		if (this.regexp || this.regexp === false) return this.regexp;
		const set = this.set;
		if (!set.length) {
			this.regexp = false;
			return this.regexp;
		}
		const options = this.options;
		const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
		const flags = new Set(options.nocase ? ["i"] : []);
		let re = set.map((pattern) => {
			const pp = pattern.map((p) => {
				if (p instanceof RegExp) for (const f of p.flags.split("")) flags.add(f);
				return typeof p === "string" ? regExpEscape(p) : p === GLOBSTAR ? GLOBSTAR : p._src;
			});
			pp.forEach((p, i) => {
				const next = pp[i + 1];
				const prev = pp[i - 1];
				if (p !== GLOBSTAR || prev === GLOBSTAR) return;
				if (prev === void 0) if (next !== void 0 && next !== GLOBSTAR) pp[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + next;
				else pp[i] = twoStar;
				else if (next === void 0) pp[i - 1] = prev + "(?:\\/|" + twoStar + ")?";
				else if (next !== GLOBSTAR) {
					pp[i - 1] = prev + "(?:\\/|\\/" + twoStar + "\\/)" + next;
					pp[i + 1] = GLOBSTAR;
				}
			});
			return pp.filter((p) => p !== GLOBSTAR).join("/");
		}).join("|");
		const [open, close] = set.length > 1 ? ["(?:", ")"] : ["", ""];
		re = "^" + open + re + close + "$";
		if (this.negate) re = "^(?!" + re + ").+$";
		try {
			this.regexp = new RegExp(re, [...flags].join(""));
		} catch (ex) {
			this.regexp = false;
		}
		/* c8 ignore stop */
		return this.regexp;
	}
	slashSplit(p) {
		if (this.preserveMultipleSlashes) return p.split("/");
		else if (this.isWindows && /^\/\/[^\/]+/.test(p)) return ["", ...p.split(/\/+/)];
		else return p.split(/\/+/);
	}
	match(f, partial = this.partial) {
		this.debug("match", f, this.pattern);
		if (this.comment) return false;
		if (this.empty) return f === "";
		if (f === "/" && partial) return true;
		const options = this.options;
		if (this.isWindows) f = f.split("\\").join("/");
		const ff = this.slashSplit(f);
		this.debug(this.pattern, "split", ff);
		const set = this.set;
		this.debug(this.pattern, "set", set);
		let filename = ff[ff.length - 1];
		if (!filename) for (let i = ff.length - 2; !filename && i >= 0; i--) filename = ff[i];
		for (let i = 0; i < set.length; i++) {
			const pattern = set[i];
			let file = ff;
			if (options.matchBase && pattern.length === 1) file = [filename];
			if (this.matchOne(file, pattern, partial)) {
				if (options.flipNegate) return true;
				return !this.negate;
			}
		}
		if (options.flipNegate) return false;
		return this.negate;
	}
	static defaults(def) {
		return minimatch.defaults(def).Minimatch;
	}
};
/* c8 ignore stop */
minimatch.AST = AST;
minimatch.Minimatch = Minimatch;
minimatch.escape = escape;
minimatch.unescape = unescape;

//#endregion
//#region node_modules/lru-cache/dist/esm/index.js
/**
* @module LRUCache
*/
const defaultPerf = typeof performance === "object" && performance && typeof performance.now === "function" ? performance : Date;
const warned = /* @__PURE__ */ new Set();
/* c8 ignore start */
const PROCESS = typeof process === "object" && !!process ? process : {};
/* c8 ignore start */
const emitWarning = (msg, type, code, fn) => {
	typeof PROCESS.emitWarning === "function" ? PROCESS.emitWarning(msg, type, code, fn) : console.error(`[${code}] ${type}: ${msg}`);
};
let AC = globalThis.AbortController;
let AS = globalThis.AbortSignal;
/* c8 ignore start */
if (typeof AC === "undefined") {
	AS = class AbortSignal {
		onabort;
		_onabort = [];
		reason;
		aborted = false;
		addEventListener(_, fn) {
			this._onabort.push(fn);
		}
	};
	AC = class AbortController {
		constructor() {
			warnACPolyfill();
		}
		signal = new AS();
		abort(reason) {
			if (this.signal.aborted) return;
			this.signal.reason = reason;
			this.signal.aborted = true;
			for (const fn of this.signal._onabort) fn(reason);
			this.signal.onabort?.(reason);
		}
	};
	let printACPolyfillWarning = PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1";
	const warnACPolyfill = () => {
		if (!printACPolyfillWarning) return;
		printACPolyfillWarning = false;
		emitWarning("AbortController is not defined. If using lru-cache in node 14, load an AbortController polyfill from the `node-abort-controller` package. A minimal polyfill is provided for use by LRUCache.fetch(), but it should not be relied upon in other contexts (eg, passing it to other APIs that use AbortController/AbortSignal might have undesirable effects). You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.", "NO_ABORT_CONTROLLER", "ENOTSUP", warnACPolyfill);
	};
}
/* c8 ignore stop */
const shouldWarn = (code) => !warned.has(code);
const isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
/* c8 ignore start */
const getUintArray = (max) => !isPosInt(max) ? null : max <= Math.pow(2, 8) ? Uint8Array : max <= Math.pow(2, 16) ? Uint16Array : max <= Math.pow(2, 32) ? Uint32Array : max <= Number.MAX_SAFE_INTEGER ? ZeroArray : null;
/* c8 ignore stop */
var ZeroArray = class extends Array {
	constructor(size) {
		super(size);
		this.fill(0);
	}
};
var Stack = class Stack {
	heap;
	length;
	static #constructing = false;
	static create(max) {
		const HeapCls = getUintArray(max);
		if (!HeapCls) return [];
		Stack.#constructing = true;
		const s = new Stack(max, HeapCls);
		Stack.#constructing = false;
		return s;
	}
	constructor(max, HeapCls) {
		/* c8 ignore start */
		if (!Stack.#constructing) throw new TypeError("instantiate Stack using Stack.create(n)");
		/* c8 ignore stop */
		this.heap = new HeapCls(max);
		this.length = 0;
	}
	push(n) {
		this.heap[this.length++] = n;
	}
	pop() {
		return this.heap[--this.length];
	}
};
/**
* Default export, the thing you're using this module to get.
*
* The `K` and `V` types define the key and value types, respectively. The
* optional `FC` type defines the type of the `context` object passed to
* `cache.fetch()` and `cache.memo()`.
*
* Keys and values **must not** be `null` or `undefined`.
*
* All properties from the options object (with the exception of `max`,
* `maxSize`, `fetchMethod`, `memoMethod`, `dispose` and `disposeAfter`) are
* added as normal public members. (The listed options are read-only getters.)
*
* Changing any of these will alter the defaults for subsequent method calls.
*/
var LRUCache = class LRUCache {
	#max;
	#maxSize;
	#dispose;
	#onInsert;
	#disposeAfter;
	#fetchMethod;
	#memoMethod;
	#perf;
	/**
	* {@link LRUCache.OptionsBase.perf}
	*/
	get perf() {
		return this.#perf;
	}
	/**
	* {@link LRUCache.OptionsBase.ttl}
	*/
	ttl;
	/**
	* {@link LRUCache.OptionsBase.ttlResolution}
	*/
	ttlResolution;
	/**
	* {@link LRUCache.OptionsBase.ttlAutopurge}
	*/
	ttlAutopurge;
	/**
	* {@link LRUCache.OptionsBase.updateAgeOnGet}
	*/
	updateAgeOnGet;
	/**
	* {@link LRUCache.OptionsBase.updateAgeOnHas}
	*/
	updateAgeOnHas;
	/**
	* {@link LRUCache.OptionsBase.allowStale}
	*/
	allowStale;
	/**
	* {@link LRUCache.OptionsBase.noDisposeOnSet}
	*/
	noDisposeOnSet;
	/**
	* {@link LRUCache.OptionsBase.noUpdateTTL}
	*/
	noUpdateTTL;
	/**
	* {@link LRUCache.OptionsBase.maxEntrySize}
	*/
	maxEntrySize;
	/**
	* {@link LRUCache.OptionsBase.sizeCalculation}
	*/
	sizeCalculation;
	/**
	* {@link LRUCache.OptionsBase.noDeleteOnFetchRejection}
	*/
	noDeleteOnFetchRejection;
	/**
	* {@link LRUCache.OptionsBase.noDeleteOnStaleGet}
	*/
	noDeleteOnStaleGet;
	/**
	* {@link LRUCache.OptionsBase.allowStaleOnFetchAbort}
	*/
	allowStaleOnFetchAbort;
	/**
	* {@link LRUCache.OptionsBase.allowStaleOnFetchRejection}
	*/
	allowStaleOnFetchRejection;
	/**
	* {@link LRUCache.OptionsBase.ignoreFetchAbort}
	*/
	ignoreFetchAbort;
	#size;
	#calculatedSize;
	#keyMap;
	#keyList;
	#valList;
	#next;
	#prev;
	#head;
	#tail;
	#free;
	#disposed;
	#sizes;
	#starts;
	#ttls;
	#hasDispose;
	#hasFetchMethod;
	#hasDisposeAfter;
	#hasOnInsert;
	/**
	* Do not call this method unless you need to inspect the
	* inner workings of the cache.  If anything returned by this
	* object is modified in any way, strange breakage may occur.
	*
	* These fields are private for a reason!
	*
	* @internal
	*/
	static unsafeExposeInternals(c) {
		return {
			starts: c.#starts,
			ttls: c.#ttls,
			sizes: c.#sizes,
			keyMap: c.#keyMap,
			keyList: c.#keyList,
			valList: c.#valList,
			next: c.#next,
			prev: c.#prev,
			get head() {
				return c.#head;
			},
			get tail() {
				return c.#tail;
			},
			free: c.#free,
			isBackgroundFetch: (p) => c.#isBackgroundFetch(p),
			backgroundFetch: (k, index, options, context) => c.#backgroundFetch(k, index, options, context),
			moveToTail: (index) => c.#moveToTail(index),
			indexes: (options) => c.#indexes(options),
			rindexes: (options) => c.#rindexes(options),
			isStale: (index) => c.#isStale(index)
		};
	}
	/**
	* {@link LRUCache.OptionsBase.max} (read-only)
	*/
	get max() {
		return this.#max;
	}
	/**
	* {@link LRUCache.OptionsBase.maxSize} (read-only)
	*/
	get maxSize() {
		return this.#maxSize;
	}
	/**
	* The total computed size of items in the cache (read-only)
	*/
	get calculatedSize() {
		return this.#calculatedSize;
	}
	/**
	* The number of items stored in the cache (read-only)
	*/
	get size() {
		return this.#size;
	}
	/**
	* {@link LRUCache.OptionsBase.fetchMethod} (read-only)
	*/
	get fetchMethod() {
		return this.#fetchMethod;
	}
	get memoMethod() {
		return this.#memoMethod;
	}
	/**
	* {@link LRUCache.OptionsBase.dispose} (read-only)
	*/
	get dispose() {
		return this.#dispose;
	}
	/**
	* {@link LRUCache.OptionsBase.onInsert} (read-only)
	*/
	get onInsert() {
		return this.#onInsert;
	}
	/**
	* {@link LRUCache.OptionsBase.disposeAfter} (read-only)
	*/
	get disposeAfter() {
		return this.#disposeAfter;
	}
	constructor(options) {
		const { max = 0, ttl, ttlResolution = 1, ttlAutopurge, updateAgeOnGet, updateAgeOnHas, allowStale, dispose, onInsert, disposeAfter, noDisposeOnSet, noUpdateTTL, maxSize = 0, maxEntrySize = 0, sizeCalculation, fetchMethod, memoMethod, noDeleteOnFetchRejection, noDeleteOnStaleGet, allowStaleOnFetchRejection, allowStaleOnFetchAbort, ignoreFetchAbort, perf } = options;
		if (perf !== void 0) {
			if (typeof perf?.now !== "function") throw new TypeError("perf option must have a now() method if specified");
		}
		this.#perf = perf ?? defaultPerf;
		if (max !== 0 && !isPosInt(max)) throw new TypeError("max option must be a nonnegative integer");
		const UintArray = max ? getUintArray(max) : Array;
		if (!UintArray) throw new Error("invalid max value: " + max);
		this.#max = max;
		this.#maxSize = maxSize;
		this.maxEntrySize = maxEntrySize || this.#maxSize;
		this.sizeCalculation = sizeCalculation;
		if (this.sizeCalculation) {
			if (!this.#maxSize && !this.maxEntrySize) throw new TypeError("cannot set sizeCalculation without setting maxSize or maxEntrySize");
			if (typeof this.sizeCalculation !== "function") throw new TypeError("sizeCalculation set to non-function");
		}
		if (memoMethod !== void 0 && typeof memoMethod !== "function") throw new TypeError("memoMethod must be a function if defined");
		this.#memoMethod = memoMethod;
		if (fetchMethod !== void 0 && typeof fetchMethod !== "function") throw new TypeError("fetchMethod must be a function if specified");
		this.#fetchMethod = fetchMethod;
		this.#hasFetchMethod = !!fetchMethod;
		this.#keyMap = /* @__PURE__ */ new Map();
		this.#keyList = new Array(max).fill(void 0);
		this.#valList = new Array(max).fill(void 0);
		this.#next = new UintArray(max);
		this.#prev = new UintArray(max);
		this.#head = 0;
		this.#tail = 0;
		this.#free = Stack.create(max);
		this.#size = 0;
		this.#calculatedSize = 0;
		if (typeof dispose === "function") this.#dispose = dispose;
		if (typeof onInsert === "function") this.#onInsert = onInsert;
		if (typeof disposeAfter === "function") {
			this.#disposeAfter = disposeAfter;
			this.#disposed = [];
		} else {
			this.#disposeAfter = void 0;
			this.#disposed = void 0;
		}
		this.#hasDispose = !!this.#dispose;
		this.#hasOnInsert = !!this.#onInsert;
		this.#hasDisposeAfter = !!this.#disposeAfter;
		this.noDisposeOnSet = !!noDisposeOnSet;
		this.noUpdateTTL = !!noUpdateTTL;
		this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
		this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
		this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
		this.ignoreFetchAbort = !!ignoreFetchAbort;
		if (this.maxEntrySize !== 0) {
			if (this.#maxSize !== 0) {
				if (!isPosInt(this.#maxSize)) throw new TypeError("maxSize must be a positive integer if specified");
			}
			if (!isPosInt(this.maxEntrySize)) throw new TypeError("maxEntrySize must be a positive integer if specified");
			this.#initializeSizeTracking();
		}
		this.allowStale = !!allowStale;
		this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
		this.updateAgeOnGet = !!updateAgeOnGet;
		this.updateAgeOnHas = !!updateAgeOnHas;
		this.ttlResolution = isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
		this.ttlAutopurge = !!ttlAutopurge;
		this.ttl = ttl || 0;
		if (this.ttl) {
			if (!isPosInt(this.ttl)) throw new TypeError("ttl must be a positive integer if specified");
			this.#initializeTTLTracking();
		}
		if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) throw new TypeError("At least one of max, maxSize, or ttl is required");
		if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
			const code = "LRU_CACHE_UNBOUNDED";
			if (shouldWarn(code)) {
				warned.add(code);
				emitWarning("TTL caching without ttlAutopurge, max, or maxSize can result in unbounded memory consumption.", "UnboundedCacheWarning", code, LRUCache);
			}
		}
	}
	/**
	* Return the number of ms left in the item's TTL. If item is not in cache,
	* returns `0`. Returns `Infinity` if item is in cache without a defined TTL.
	*/
	getRemainingTTL(key) {
		return this.#keyMap.has(key) ? Infinity : 0;
	}
	#initializeTTLTracking() {
		const ttls = new ZeroArray(this.#max);
		const starts = new ZeroArray(this.#max);
		this.#ttls = ttls;
		this.#starts = starts;
		this.#setItemTTL = (index, ttl, start = this.#perf.now()) => {
			starts[index] = ttl !== 0 ? start : 0;
			ttls[index] = ttl;
			if (ttl !== 0 && this.ttlAutopurge) {
				const t = setTimeout(() => {
					if (this.#isStale(index)) this.#delete(this.#keyList[index], "expire");
				}, ttl + 1);
				/* c8 ignore start */
				if (t.unref) t.unref();
			}
		};
		this.#updateItemAge = (index) => {
			starts[index] = ttls[index] !== 0 ? this.#perf.now() : 0;
		};
		this.#statusTTL = (status, index) => {
			if (ttls[index]) {
				const ttl = ttls[index];
				const start = starts[index];
				/* c8 ignore next */
				if (!ttl || !start) return;
				status.ttl = ttl;
				status.start = start;
				status.now = cachedNow || getNow();
				status.remainingTTL = ttl - (status.now - start);
			}
		};
		let cachedNow = 0;
		const getNow = () => {
			const n = this.#perf.now();
			if (this.ttlResolution > 0) {
				cachedNow = n;
				const t = setTimeout(() => cachedNow = 0, this.ttlResolution);
				/* c8 ignore start */
				if (t.unref) t.unref();
			}
			return n;
		};
		this.getRemainingTTL = (key) => {
			const index = this.#keyMap.get(key);
			if (index === void 0) return 0;
			const ttl = ttls[index];
			const start = starts[index];
			if (!ttl || !start) return Infinity;
			return ttl - ((cachedNow || getNow()) - start);
		};
		this.#isStale = (index) => {
			const s = starts[index];
			const t = ttls[index];
			return !!t && !!s && (cachedNow || getNow()) - s > t;
		};
	}
	#updateItemAge = () => {};
	#statusTTL = () => {};
	#setItemTTL = () => {};
	/* c8 ignore stop */
	#isStale = () => false;
	#initializeSizeTracking() {
		const sizes = new ZeroArray(this.#max);
		this.#calculatedSize = 0;
		this.#sizes = sizes;
		this.#removeItemSize = (index) => {
			this.#calculatedSize -= sizes[index];
			sizes[index] = 0;
		};
		this.#requireSize = (k, v, size, sizeCalculation) => {
			if (this.#isBackgroundFetch(v)) return 0;
			if (!isPosInt(size)) if (sizeCalculation) {
				if (typeof sizeCalculation !== "function") throw new TypeError("sizeCalculation must be a function");
				size = sizeCalculation(v, k);
				if (!isPosInt(size)) throw new TypeError("sizeCalculation return invalid (expect positive integer)");
			} else throw new TypeError("invalid size value (must be positive integer). When maxSize or maxEntrySize is used, sizeCalculation or size must be set.");
			return size;
		};
		this.#addItemSize = (index, size, status) => {
			sizes[index] = size;
			if (this.#maxSize) {
				const maxSize = this.#maxSize - sizes[index];
				while (this.#calculatedSize > maxSize) this.#evict(true);
			}
			this.#calculatedSize += sizes[index];
			if (status) {
				status.entrySize = size;
				status.totalCalculatedSize = this.#calculatedSize;
			}
		};
	}
	#removeItemSize = (_i) => {};
	#addItemSize = (_i, _s, _st) => {};
	#requireSize = (_k, _v, size, sizeCalculation) => {
		if (size || sizeCalculation) throw new TypeError("cannot set size without setting maxSize or maxEntrySize on cache");
		return 0;
	};
	*#indexes({ allowStale = this.allowStale } = {}) {
		if (this.#size) for (let i = this.#tail;;) {
			if (!this.#isValidIndex(i)) break;
			if (allowStale || !this.#isStale(i)) yield i;
			if (i === this.#head) break;
			else i = this.#prev[i];
		}
	}
	*#rindexes({ allowStale = this.allowStale } = {}) {
		if (this.#size) for (let i = this.#head;;) {
			if (!this.#isValidIndex(i)) break;
			if (allowStale || !this.#isStale(i)) yield i;
			if (i === this.#tail) break;
			else i = this.#next[i];
		}
	}
	#isValidIndex(index) {
		return index !== void 0 && this.#keyMap.get(this.#keyList[index]) === index;
	}
	/**
	* Return a generator yielding `[key, value]` pairs,
	* in order from most recently used to least recently used.
	*/
	*entries() {
		for (const i of this.#indexes()) if (this.#valList[i] !== void 0 && this.#keyList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield [this.#keyList[i], this.#valList[i]];
	}
	/**
	* Inverse order version of {@link LRUCache.entries}
	*
	* Return a generator yielding `[key, value]` pairs,
	* in order from least recently used to most recently used.
	*/
	*rentries() {
		for (const i of this.#rindexes()) if (this.#valList[i] !== void 0 && this.#keyList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield [this.#keyList[i], this.#valList[i]];
	}
	/**
	* Return a generator yielding the keys in the cache,
	* in order from most recently used to least recently used.
	*/
	*keys() {
		for (const i of this.#indexes()) {
			const k = this.#keyList[i];
			if (k !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield k;
		}
	}
	/**
	* Inverse order version of {@link LRUCache.keys}
	*
	* Return a generator yielding the keys in the cache,
	* in order from least recently used to most recently used.
	*/
	*rkeys() {
		for (const i of this.#rindexes()) {
			const k = this.#keyList[i];
			if (k !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield k;
		}
	}
	/**
	* Return a generator yielding the values in the cache,
	* in order from most recently used to least recently used.
	*/
	*values() {
		for (const i of this.#indexes()) if (this.#valList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield this.#valList[i];
	}
	/**
	* Inverse order version of {@link LRUCache.values}
	*
	* Return a generator yielding the values in the cache,
	* in order from least recently used to most recently used.
	*/
	*rvalues() {
		for (const i of this.#rindexes()) if (this.#valList[i] !== void 0 && !this.#isBackgroundFetch(this.#valList[i])) yield this.#valList[i];
	}
	/**
	* Iterating over the cache itself yields the same results as
	* {@link LRUCache.entries}
	*/
	[Symbol.iterator]() {
		return this.entries();
	}
	/**
	* A String value that is used in the creation of the default string
	* description of an object. Called by the built-in method
	* `Object.prototype.toString`.
	*/
	[Symbol.toStringTag] = "LRUCache";
	/**
	* Find a value for which the supplied fn method returns a truthy value,
	* similar to `Array.find()`. fn is called as `fn(value, key, cache)`.
	*/
	find(fn, getOptions = {}) {
		for (const i of this.#indexes()) {
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0) continue;
			if (fn(value, this.#keyList[i], this)) return this.get(this.#keyList[i], getOptions);
		}
	}
	/**
	* Call the supplied function on each item in the cache, in order from most
	* recently used to least recently used.
	*
	* `fn` is called as `fn(value, key, cache)`.
	*
	* If `thisp` is provided, function will be called in the `this`-context of
	* the provided object, or the cache if no `thisp` object is provided.
	*
	* Does not update age or recenty of use, or iterate over stale values.
	*/
	forEach(fn, thisp = this) {
		for (const i of this.#indexes()) {
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0) continue;
			fn.call(thisp, value, this.#keyList[i], this);
		}
	}
	/**
	* The same as {@link LRUCache.forEach} but items are iterated over in
	* reverse order.  (ie, less recently used items are iterated over first.)
	*/
	rforEach(fn, thisp = this) {
		for (const i of this.#rindexes()) {
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0) continue;
			fn.call(thisp, value, this.#keyList[i], this);
		}
	}
	/**
	* Delete any stale entries. Returns true if anything was removed,
	* false otherwise.
	*/
	purgeStale() {
		let deleted = false;
		for (const i of this.#rindexes({ allowStale: true })) if (this.#isStale(i)) {
			this.#delete(this.#keyList[i], "expire");
			deleted = true;
		}
		return deleted;
	}
	/**
	* Get the extended info about a given entry, to get its value, size, and
	* TTL info simultaneously. Returns `undefined` if the key is not present.
	*
	* Unlike {@link LRUCache#dump}, which is designed to be portable and survive
	* serialization, the `start` value is always the current timestamp, and the
	* `ttl` is a calculated remaining time to live (negative if expired).
	*
	* Always returns stale values, if their info is found in the cache, so be
	* sure to check for expirations (ie, a negative {@link LRUCache.Entry#ttl})
	* if relevant.
	*/
	info(key) {
		const i = this.#keyMap.get(key);
		if (i === void 0) return void 0;
		const v = this.#valList[i];
		/* c8 ignore start - this isn't tested for the info function,
		* but it's the same logic as found in other places. */
		const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
		if (value === void 0) return void 0;
		/* c8 ignore end */
		const entry = { value };
		if (this.#ttls && this.#starts) {
			const ttl = this.#ttls[i];
			const start = this.#starts[i];
			if (ttl && start) {
				entry.ttl = ttl - (this.#perf.now() - start);
				entry.start = Date.now();
			}
		}
		if (this.#sizes) entry.size = this.#sizes[i];
		return entry;
	}
	/**
	* Return an array of [key, {@link LRUCache.Entry}] tuples which can be
	* passed to {@link LRUCache#load}.
	*
	* The `start` fields are calculated relative to a portable `Date.now()`
	* timestamp, even if `performance.now()` is available.
	*
	* Stale entries are always included in the `dump`, even if
	* {@link LRUCache.OptionsBase.allowStale} is false.
	*
	* Note: this returns an actual array, not a generator, so it can be more
	* easily passed around.
	*/
	dump() {
		const arr = [];
		for (const i of this.#indexes({ allowStale: true })) {
			const key = this.#keyList[i];
			const v = this.#valList[i];
			const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
			if (value === void 0 || key === void 0) continue;
			const entry = { value };
			if (this.#ttls && this.#starts) {
				entry.ttl = this.#ttls[i];
				const age = this.#perf.now() - this.#starts[i];
				entry.start = Math.floor(Date.now() - age);
			}
			if (this.#sizes) entry.size = this.#sizes[i];
			arr.unshift([key, entry]);
		}
		return arr;
	}
	/**
	* Reset the cache and load in the items in entries in the order listed.
	*
	* The shape of the resulting cache may be different if the same options are
	* not used in both caches.
	*
	* The `start` fields are assumed to be calculated relative to a portable
	* `Date.now()` timestamp, even if `performance.now()` is available.
	*/
	load(arr) {
		this.clear();
		for (const [key, entry] of arr) {
			if (entry.start) {
				const age = Date.now() - entry.start;
				entry.start = this.#perf.now() - age;
			}
			this.set(key, entry.value, entry);
		}
	}
	/**
	* Add a value to the cache.
	*
	* Note: if `undefined` is specified as a value, this is an alias for
	* {@link LRUCache#delete}
	*
	* Fields on the {@link LRUCache.SetOptions} options param will override
	* their corresponding values in the constructor options for the scope
	* of this single `set()` operation.
	*
	* If `start` is provided, then that will set the effective start
	* time for the TTL calculation. Note that this must be a previous
	* value of `performance.now()` if supported, or a previous value of
	* `Date.now()` if not.
	*
	* Options object may also include `size`, which will prevent
	* calling the `sizeCalculation` function and just use the specified
	* number if it is a positive integer, and `noDisposeOnSet` which
	* will prevent calling a `dispose` function in the case of
	* overwrites.
	*
	* If the `size` (or return value of `sizeCalculation`) for a given
	* entry is greater than `maxEntrySize`, then the item will not be
	* added to the cache.
	*
	* Will update the recency of the entry.
	*
	* If the value is `undefined`, then this is an alias for
	* `cache.delete(key)`. `undefined` is never stored in the cache.
	*/
	set(k, v, setOptions = {}) {
		if (v === void 0) {
			this.delete(k);
			return this;
		}
		const { ttl = this.ttl, start, noDisposeOnSet = this.noDisposeOnSet, sizeCalculation = this.sizeCalculation, status } = setOptions;
		let { noUpdateTTL = this.noUpdateTTL } = setOptions;
		const size = this.#requireSize(k, v, setOptions.size || 0, sizeCalculation);
		if (this.maxEntrySize && size > this.maxEntrySize) {
			if (status) {
				status.set = "miss";
				status.maxEntrySizeExceeded = true;
			}
			this.#delete(k, "set");
			return this;
		}
		let index = this.#size === 0 ? void 0 : this.#keyMap.get(k);
		if (index === void 0) {
			index = this.#size === 0 ? this.#tail : this.#free.length !== 0 ? this.#free.pop() : this.#size === this.#max ? this.#evict(false) : this.#size;
			this.#keyList[index] = k;
			this.#valList[index] = v;
			this.#keyMap.set(k, index);
			this.#next[this.#tail] = index;
			this.#prev[index] = this.#tail;
			this.#tail = index;
			this.#size++;
			this.#addItemSize(index, size, status);
			if (status) status.set = "add";
			noUpdateTTL = false;
			if (this.#hasOnInsert) this.#onInsert?.(v, k, "add");
		} else {
			this.#moveToTail(index);
			const oldVal = this.#valList[index];
			if (v !== oldVal) {
				if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
					oldVal.__abortController.abort(/* @__PURE__ */ new Error("replaced"));
					const { __staleWhileFetching: s } = oldVal;
					if (s !== void 0 && !noDisposeOnSet) {
						if (this.#hasDispose) this.#dispose?.(s, k, "set");
						if (this.#hasDisposeAfter) this.#disposed?.push([
							s,
							k,
							"set"
						]);
					}
				} else if (!noDisposeOnSet) {
					if (this.#hasDispose) this.#dispose?.(oldVal, k, "set");
					if (this.#hasDisposeAfter) this.#disposed?.push([
						oldVal,
						k,
						"set"
					]);
				}
				this.#removeItemSize(index);
				this.#addItemSize(index, size, status);
				this.#valList[index] = v;
				if (status) {
					status.set = "replace";
					const oldValue = oldVal && this.#isBackgroundFetch(oldVal) ? oldVal.__staleWhileFetching : oldVal;
					if (oldValue !== void 0) status.oldValue = oldValue;
				}
			} else if (status) status.set = "update";
			if (this.#hasOnInsert) this.onInsert?.(v, k, v === oldVal ? "update" : "replace");
		}
		if (ttl !== 0 && !this.#ttls) this.#initializeTTLTracking();
		if (this.#ttls) {
			if (!noUpdateTTL) this.#setItemTTL(index, ttl, start);
			if (status) this.#statusTTL(status, index);
		}
		if (!noDisposeOnSet && this.#hasDisposeAfter && this.#disposed) {
			const dt = this.#disposed;
			let task;
			while (task = dt?.shift()) this.#disposeAfter?.(...task);
		}
		return this;
	}
	/**
	* Evict the least recently used item, returning its value or
	* `undefined` if cache is empty.
	*/
	pop() {
		try {
			while (this.#size) {
				const val = this.#valList[this.#head];
				this.#evict(true);
				if (this.#isBackgroundFetch(val)) {
					if (val.__staleWhileFetching) return val.__staleWhileFetching;
				} else if (val !== void 0) return val;
			}
		} finally {
			if (this.#hasDisposeAfter && this.#disposed) {
				const dt = this.#disposed;
				let task;
				while (task = dt?.shift()) this.#disposeAfter?.(...task);
			}
		}
	}
	#evict(free) {
		const head = this.#head;
		const k = this.#keyList[head];
		const v = this.#valList[head];
		if (this.#hasFetchMethod && this.#isBackgroundFetch(v)) v.__abortController.abort(/* @__PURE__ */ new Error("evicted"));
		else if (this.#hasDispose || this.#hasDisposeAfter) {
			if (this.#hasDispose) this.#dispose?.(v, k, "evict");
			if (this.#hasDisposeAfter) this.#disposed?.push([
				v,
				k,
				"evict"
			]);
		}
		this.#removeItemSize(head);
		if (free) {
			this.#keyList[head] = void 0;
			this.#valList[head] = void 0;
			this.#free.push(head);
		}
		if (this.#size === 1) {
			this.#head = this.#tail = 0;
			this.#free.length = 0;
		} else this.#head = this.#next[head];
		this.#keyMap.delete(k);
		this.#size--;
		return head;
	}
	/**
	* Check if a key is in the cache, without updating the recency of use.
	* Will return false if the item is stale, even though it is technically
	* in the cache.
	*
	* Check if a key is in the cache, without updating the recency of
	* use. Age is updated if {@link LRUCache.OptionsBase.updateAgeOnHas} is set
	* to `true` in either the options or the constructor.
	*
	* Will return `false` if the item is stale, even though it is technically in
	* the cache. The difference can be determined (if it matters) by using a
	* `status` argument, and inspecting the `has` field.
	*
	* Will not update item age unless
	* {@link LRUCache.OptionsBase.updateAgeOnHas} is set.
	*/
	has(k, hasOptions = {}) {
		const { updateAgeOnHas = this.updateAgeOnHas, status } = hasOptions;
		const index = this.#keyMap.get(k);
		if (index !== void 0) {
			const v = this.#valList[index];
			if (this.#isBackgroundFetch(v) && v.__staleWhileFetching === void 0) return false;
			if (!this.#isStale(index)) {
				if (updateAgeOnHas) this.#updateItemAge(index);
				if (status) {
					status.has = "hit";
					this.#statusTTL(status, index);
				}
				return true;
			} else if (status) {
				status.has = "stale";
				this.#statusTTL(status, index);
			}
		} else if (status) status.has = "miss";
		return false;
	}
	/**
	* Like {@link LRUCache#get} but doesn't update recency or delete stale
	* items.
	*
	* Returns `undefined` if the item is stale, unless
	* {@link LRUCache.OptionsBase.allowStale} is set.
	*/
	peek(k, peekOptions = {}) {
		const { allowStale = this.allowStale } = peekOptions;
		const index = this.#keyMap.get(k);
		if (index === void 0 || !allowStale && this.#isStale(index)) return;
		const v = this.#valList[index];
		return this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
	}
	#backgroundFetch(k, index, options, context) {
		const v = index === void 0 ? void 0 : this.#valList[index];
		if (this.#isBackgroundFetch(v)) return v;
		const ac = new AC();
		const { signal } = options;
		signal?.addEventListener("abort", () => ac.abort(signal.reason), { signal: ac.signal });
		const fetchOpts = {
			signal: ac.signal,
			options,
			context
		};
		const cb = (v$1, updateCache = false) => {
			const { aborted } = ac.signal;
			const ignoreAbort = options.ignoreFetchAbort && v$1 !== void 0;
			if (options.status) if (aborted && !updateCache) {
				options.status.fetchAborted = true;
				options.status.fetchError = ac.signal.reason;
				if (ignoreAbort) options.status.fetchAbortIgnored = true;
			} else options.status.fetchResolved = true;
			if (aborted && !ignoreAbort && !updateCache) return fetchFail(ac.signal.reason);
			const bf$1 = p;
			const vl = this.#valList[index];
			if (vl === p || ignoreAbort && updateCache && vl === void 0) if (v$1 === void 0) if (bf$1.__staleWhileFetching !== void 0) this.#valList[index] = bf$1.__staleWhileFetching;
			else this.#delete(k, "fetch");
			else {
				if (options.status) options.status.fetchUpdated = true;
				this.set(k, v$1, fetchOpts.options);
			}
			return v$1;
		};
		const eb = (er) => {
			if (options.status) {
				options.status.fetchRejected = true;
				options.status.fetchError = er;
			}
			return fetchFail(er);
		};
		const fetchFail = (er) => {
			const { aborted } = ac.signal;
			const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
			const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
			const noDelete = allowStale || options.noDeleteOnFetchRejection;
			const bf$1 = p;
			if (this.#valList[index] === p) {
				if (!noDelete || bf$1.__staleWhileFetching === void 0) this.#delete(k, "fetch");
				else if (!allowStaleAborted) this.#valList[index] = bf$1.__staleWhileFetching;
			}
			if (allowStale) {
				if (options.status && bf$1.__staleWhileFetching !== void 0) options.status.returnedStale = true;
				return bf$1.__staleWhileFetching;
			} else if (bf$1.__returned === bf$1) throw er;
		};
		const pcall = (res, rej) => {
			const fmp = this.#fetchMethod?.(k, v, fetchOpts);
			if (fmp && fmp instanceof Promise) fmp.then((v$1) => res(v$1 === void 0 ? void 0 : v$1), rej);
			ac.signal.addEventListener("abort", () => {
				if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
					res(void 0);
					if (options.allowStaleOnFetchAbort) res = (v$1) => cb(v$1, true);
				}
			});
		};
		if (options.status) options.status.fetchDispatched = true;
		const p = new Promise(pcall).then(cb, eb);
		const bf = Object.assign(p, {
			__abortController: ac,
			__staleWhileFetching: v,
			__returned: void 0
		});
		if (index === void 0) {
			this.set(k, bf, {
				...fetchOpts.options,
				status: void 0
			});
			index = this.#keyMap.get(k);
		} else this.#valList[index] = bf;
		return bf;
	}
	#isBackgroundFetch(p) {
		if (!this.#hasFetchMethod) return false;
		const b = p;
		return !!b && b instanceof Promise && b.hasOwnProperty("__staleWhileFetching") && b.__abortController instanceof AC;
	}
	async fetch(k, fetchOptions = {}) {
		const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, ttl = this.ttl, noDisposeOnSet = this.noDisposeOnSet, size = 0, sizeCalculation = this.sizeCalculation, noUpdateTTL = this.noUpdateTTL, noDeleteOnFetchRejection = this.noDeleteOnFetchRejection, allowStaleOnFetchRejection = this.allowStaleOnFetchRejection, ignoreFetchAbort = this.ignoreFetchAbort, allowStaleOnFetchAbort = this.allowStaleOnFetchAbort, context, forceRefresh = false, status, signal } = fetchOptions;
		if (!this.#hasFetchMethod) {
			if (status) status.fetch = "get";
			return this.get(k, {
				allowStale,
				updateAgeOnGet,
				noDeleteOnStaleGet,
				status
			});
		}
		const options = {
			allowStale,
			updateAgeOnGet,
			noDeleteOnStaleGet,
			ttl,
			noDisposeOnSet,
			size,
			sizeCalculation,
			noUpdateTTL,
			noDeleteOnFetchRejection,
			allowStaleOnFetchRejection,
			allowStaleOnFetchAbort,
			ignoreFetchAbort,
			status,
			signal
		};
		let index = this.#keyMap.get(k);
		if (index === void 0) {
			if (status) status.fetch = "miss";
			const p = this.#backgroundFetch(k, index, options, context);
			return p.__returned = p;
		} else {
			const v = this.#valList[index];
			if (this.#isBackgroundFetch(v)) {
				const stale = allowStale && v.__staleWhileFetching !== void 0;
				if (status) {
					status.fetch = "inflight";
					if (stale) status.returnedStale = true;
				}
				return stale ? v.__staleWhileFetching : v.__returned = v;
			}
			const isStale = this.#isStale(index);
			if (!forceRefresh && !isStale) {
				if (status) status.fetch = "hit";
				this.#moveToTail(index);
				if (updateAgeOnGet) this.#updateItemAge(index);
				if (status) this.#statusTTL(status, index);
				return v;
			}
			const p = this.#backgroundFetch(k, index, options, context);
			const staleVal = p.__staleWhileFetching !== void 0 && allowStale;
			if (status) {
				status.fetch = isStale ? "stale" : "refresh";
				if (staleVal && isStale) status.returnedStale = true;
			}
			return staleVal ? p.__staleWhileFetching : p.__returned = p;
		}
	}
	async forceFetch(k, fetchOptions = {}) {
		const v = await this.fetch(k, fetchOptions);
		if (v === void 0) throw new Error("fetch() returned undefined");
		return v;
	}
	memo(k, memoOptions = {}) {
		const memoMethod = this.#memoMethod;
		if (!memoMethod) throw new Error("no memoMethod provided to constructor");
		const { context, forceRefresh,...options } = memoOptions;
		const v = this.get(k, options);
		if (!forceRefresh && v !== void 0) return v;
		const vv = memoMethod(k, v, {
			options,
			context
		});
		this.set(k, vv, options);
		return vv;
	}
	/**
	* Return a value from the cache. Will update the recency of the cache
	* entry found.
	*
	* If the key is not found, get() will return `undefined`.
	*/
	get(k, getOptions = {}) {
		const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, status } = getOptions;
		const index = this.#keyMap.get(k);
		if (index !== void 0) {
			const value = this.#valList[index];
			const fetching = this.#isBackgroundFetch(value);
			if (status) this.#statusTTL(status, index);
			if (this.#isStale(index)) {
				if (status) status.get = "stale";
				if (!fetching) {
					if (!noDeleteOnStaleGet) this.#delete(k, "expire");
					if (status && allowStale) status.returnedStale = true;
					return allowStale ? value : void 0;
				} else {
					if (status && allowStale && value.__staleWhileFetching !== void 0) status.returnedStale = true;
					return allowStale ? value.__staleWhileFetching : void 0;
				}
			} else {
				if (status) status.get = "hit";
				if (fetching) return value.__staleWhileFetching;
				this.#moveToTail(index);
				if (updateAgeOnGet) this.#updateItemAge(index);
				return value;
			}
		} else if (status) status.get = "miss";
	}
	#connect(p, n) {
		this.#prev[n] = p;
		this.#next[p] = n;
	}
	#moveToTail(index) {
		if (index !== this.#tail) {
			if (index === this.#head) this.#head = this.#next[index];
			else this.#connect(this.#prev[index], this.#next[index]);
			this.#connect(this.#tail, index);
			this.#tail = index;
		}
	}
	/**
	* Deletes a key out of the cache.
	*
	* Returns true if the key was deleted, false otherwise.
	*/
	delete(k) {
		return this.#delete(k, "delete");
	}
	#delete(k, reason) {
		let deleted = false;
		if (this.#size !== 0) {
			const index = this.#keyMap.get(k);
			if (index !== void 0) {
				deleted = true;
				if (this.#size === 1) this.#clear(reason);
				else {
					this.#removeItemSize(index);
					const v = this.#valList[index];
					if (this.#isBackgroundFetch(v)) v.__abortController.abort(/* @__PURE__ */ new Error("deleted"));
					else if (this.#hasDispose || this.#hasDisposeAfter) {
						if (this.#hasDispose) this.#dispose?.(v, k, reason);
						if (this.#hasDisposeAfter) this.#disposed?.push([
							v,
							k,
							reason
						]);
					}
					this.#keyMap.delete(k);
					this.#keyList[index] = void 0;
					this.#valList[index] = void 0;
					if (index === this.#tail) this.#tail = this.#prev[index];
					else if (index === this.#head) this.#head = this.#next[index];
					else {
						const pi = this.#prev[index];
						this.#next[pi] = this.#next[index];
						const ni = this.#next[index];
						this.#prev[ni] = this.#prev[index];
					}
					this.#size--;
					this.#free.push(index);
				}
			}
		}
		if (this.#hasDisposeAfter && this.#disposed?.length) {
			const dt = this.#disposed;
			let task;
			while (task = dt?.shift()) this.#disposeAfter?.(...task);
		}
		return deleted;
	}
	/**
	* Clear the cache entirely, throwing away all values.
	*/
	clear() {
		return this.#clear("delete");
	}
	#clear(reason) {
		for (const index of this.#rindexes({ allowStale: true })) {
			const v = this.#valList[index];
			if (this.#isBackgroundFetch(v)) v.__abortController.abort(/* @__PURE__ */ new Error("deleted"));
			else {
				const k = this.#keyList[index];
				if (this.#hasDispose) this.#dispose?.(v, k, reason);
				if (this.#hasDisposeAfter) this.#disposed?.push([
					v,
					k,
					reason
				]);
			}
		}
		this.#keyMap.clear();
		this.#valList.fill(void 0);
		this.#keyList.fill(void 0);
		if (this.#ttls && this.#starts) {
			this.#ttls.fill(0);
			this.#starts.fill(0);
		}
		if (this.#sizes) this.#sizes.fill(0);
		this.#head = 0;
		this.#tail = 0;
		this.#free.length = 0;
		this.#calculatedSize = 0;
		this.#size = 0;
		if (this.#hasDisposeAfter && this.#disposed) {
			const dt = this.#disposed;
			let task;
			while (task = dt?.shift()) this.#disposeAfter?.(...task);
		}
	}
};

//#endregion
//#region node_modules/minipass/dist/esm/index.js
const proc = typeof process === "object" && process ? process : {
	stdout: null,
	stderr: null
};
/**
* Return true if the argument is a Minipass stream, Node stream, or something
* else that Minipass can interact with.
*/
const isStream = (s) => !!s && typeof s === "object" && (s instanceof Minipass || s instanceof Stream || isReadable(s) || isWritable(s));
/**
* Return true if the argument is a valid {@link Minipass.Readable}
*/
const isReadable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter && typeof s.pipe === "function" && s.pipe !== Stream.Writable.prototype.pipe;
/**
* Return true if the argument is a valid {@link Minipass.Writable}
*/
const isWritable = (s) => !!s && typeof s === "object" && s instanceof EventEmitter && typeof s.write === "function" && typeof s.end === "function";
const EOF = Symbol("EOF");
const MAYBE_EMIT_END = Symbol("maybeEmitEnd");
const EMITTED_END = Symbol("emittedEnd");
const EMITTING_END = Symbol("emittingEnd");
const EMITTED_ERROR = Symbol("emittedError");
const CLOSED = Symbol("closed");
const READ = Symbol("read");
const FLUSH = Symbol("flush");
const FLUSHCHUNK = Symbol("flushChunk");
const ENCODING = Symbol("encoding");
const DECODER = Symbol("decoder");
const FLOWING = Symbol("flowing");
const PAUSED = Symbol("paused");
const RESUME = Symbol("resume");
const BUFFER = Symbol("buffer");
const PIPES = Symbol("pipes");
const BUFFERLENGTH = Symbol("bufferLength");
const BUFFERPUSH = Symbol("bufferPush");
const BUFFERSHIFT = Symbol("bufferShift");
const OBJECTMODE = Symbol("objectMode");
const DESTROYED = Symbol("destroyed");
const ERROR = Symbol("error");
const EMITDATA = Symbol("emitData");
const EMITEND = Symbol("emitEnd");
const EMITEND2 = Symbol("emitEnd2");
const ASYNC = Symbol("async");
const ABORT = Symbol("abort");
const ABORTED = Symbol("aborted");
const SIGNAL = Symbol("signal");
const DATALISTENERS = Symbol("dataListeners");
const DISCARDED = Symbol("discarded");
const defer = (fn) => Promise.resolve().then(fn);
const nodefer = (fn) => fn();
const isEndish = (ev) => ev === "end" || ev === "finish" || ev === "prefinish";
const isArrayBufferLike = (b) => b instanceof ArrayBuffer || !!b && typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
const isArrayBufferView = (b) => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
/**
* Internal class representing a pipe to a destination stream.
*
* @internal
*/
var Pipe = class {
	src;
	dest;
	opts;
	ondrain;
	constructor(src, dest, opts) {
		this.src = src;
		this.dest = dest;
		this.opts = opts;
		this.ondrain = () => src[RESUME]();
		this.dest.on("drain", this.ondrain);
	}
	unpipe() {
		this.dest.removeListener("drain", this.ondrain);
	}
	/* c8 ignore start */
	proxyErrors(_er) {}
	/* c8 ignore stop */
	end() {
		this.unpipe();
		if (this.opts.end) this.dest.end();
	}
};
/**
* Internal class representing a pipe to a destination stream where
* errors are proxied.
*
* @internal
*/
var PipeProxyErrors = class extends Pipe {
	unpipe() {
		this.src.removeListener("error", this.proxyErrors);
		super.unpipe();
	}
	constructor(src, dest, opts) {
		super(src, dest, opts);
		this.proxyErrors = (er) => dest.emit("error", er);
		src.on("error", this.proxyErrors);
	}
};
const isObjectModeOptions = (o) => !!o.objectMode;
const isEncodingOptions = (o) => !o.objectMode && !!o.encoding && o.encoding !== "buffer";
/**
* Main export, the Minipass class
*
* `RType` is the type of data emitted, defaults to Buffer
*
* `WType` is the type of data to be written, if RType is buffer or string,
* then any {@link Minipass.ContiguousData} is allowed.
*
* `Events` is the set of event handler signatures that this object
* will emit, see {@link Minipass.Events}
*/
var Minipass = class extends EventEmitter {
	[FLOWING] = false;
	[PAUSED] = false;
	[PIPES] = [];
	[BUFFER] = [];
	[OBJECTMODE];
	[ENCODING];
	[ASYNC];
	[DECODER];
	[EOF] = false;
	[EMITTED_END] = false;
	[EMITTING_END] = false;
	[CLOSED] = false;
	[EMITTED_ERROR] = null;
	[BUFFERLENGTH] = 0;
	[DESTROYED] = false;
	[SIGNAL];
	[ABORTED] = false;
	[DATALISTENERS] = 0;
	[DISCARDED] = false;
	/**
	* true if the stream can be written
	*/
	writable = true;
	/**
	* true if the stream can be read
	*/
	readable = true;
	/**
	* If `RType` is Buffer, then options do not need to be provided.
	* Otherwise, an options object must be provided to specify either
	* {@link Minipass.SharedOptions.objectMode} or
	* {@link Minipass.SharedOptions.encoding}, as appropriate.
	*/
	constructor(...args) {
		const options = args[0] || {};
		super();
		if (options.objectMode && typeof options.encoding === "string") throw new TypeError("Encoding and objectMode may not be used together");
		if (isObjectModeOptions(options)) {
			this[OBJECTMODE] = true;
			this[ENCODING] = null;
		} else if (isEncodingOptions(options)) {
			this[ENCODING] = options.encoding;
			this[OBJECTMODE] = false;
		} else {
			this[OBJECTMODE] = false;
			this[ENCODING] = null;
		}
		this[ASYNC] = !!options.async;
		this[DECODER] = this[ENCODING] ? new StringDecoder(this[ENCODING]) : null;
		if (options && options.debugExposeBuffer === true) Object.defineProperty(this, "buffer", { get: () => this[BUFFER] });
		if (options && options.debugExposePipes === true) Object.defineProperty(this, "pipes", { get: () => this[PIPES] });
		const { signal } = options;
		if (signal) {
			this[SIGNAL] = signal;
			if (signal.aborted) this[ABORT]();
			else signal.addEventListener("abort", () => this[ABORT]());
		}
	}
	/**
	* The amount of data stored in the buffer waiting to be read.
	*
	* For Buffer strings, this will be the total byte length.
	* For string encoding streams, this will be the string character length,
	* according to JavaScript's `string.length` logic.
	* For objectMode streams, this is a count of the items waiting to be
	* emitted.
	*/
	get bufferLength() {
		return this[BUFFERLENGTH];
	}
	/**
	* The `BufferEncoding` currently in use, or `null`
	*/
	get encoding() {
		return this[ENCODING];
	}
	/**
	* @deprecated - This is a read only property
	*/
	set encoding(_enc) {
		throw new Error("Encoding must be set at instantiation time");
	}
	/**
	* @deprecated - Encoding may only be set at instantiation time
	*/
	setEncoding(_enc) {
		throw new Error("Encoding must be set at instantiation time");
	}
	/**
	* True if this is an objectMode stream
	*/
	get objectMode() {
		return this[OBJECTMODE];
	}
	/**
	* @deprecated - This is a read-only property
	*/
	set objectMode(_om) {
		throw new Error("objectMode must be set at instantiation time");
	}
	/**
	* true if this is an async stream
	*/
	get ["async"]() {
		return this[ASYNC];
	}
	/**
	* Set to true to make this stream async.
	*
	* Once set, it cannot be unset, as this would potentially cause incorrect
	* behavior.  Ie, a sync stream can be made async, but an async stream
	* cannot be safely made sync.
	*/
	set ["async"](a) {
		this[ASYNC] = this[ASYNC] || !!a;
	}
	[ABORT]() {
		this[ABORTED] = true;
		this.emit("abort", this[SIGNAL]?.reason);
		this.destroy(this[SIGNAL]?.reason);
	}
	/**
	* True if the stream has been aborted.
	*/
	get aborted() {
		return this[ABORTED];
	}
	/**
	* No-op setter. Stream aborted status is set via the AbortSignal provided
	* in the constructor options.
	*/
	set aborted(_) {}
	write(chunk, encoding, cb) {
		if (this[ABORTED]) return false;
		if (this[EOF]) throw new Error("write after end");
		if (this[DESTROYED]) {
			this.emit("error", Object.assign(/* @__PURE__ */ new Error("Cannot call write after a stream was destroyed"), { code: "ERR_STREAM_DESTROYED" }));
			return true;
		}
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = "utf8";
		}
		if (!encoding) encoding = "utf8";
		const fn = this[ASYNC] ? defer : nodefer;
		if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
			if (isArrayBufferView(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
			else if (isArrayBufferLike(chunk)) chunk = Buffer.from(chunk);
			else if (typeof chunk !== "string") throw new Error("Non-contiguous data written to non-objectMode stream");
		}
		if (this[OBJECTMODE]) {
			/* c8 ignore start */
			if (this[FLOWING] && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
			/* c8 ignore stop */
			if (this[FLOWING]) this.emit("data", chunk);
			else this[BUFFERPUSH](chunk);
			if (this[BUFFERLENGTH] !== 0) this.emit("readable");
			if (cb) fn(cb);
			return this[FLOWING];
		}
		if (!chunk.length) {
			if (this[BUFFERLENGTH] !== 0) this.emit("readable");
			if (cb) fn(cb);
			return this[FLOWING];
		}
		if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER]?.lastNeed)) chunk = Buffer.from(chunk, encoding);
		if (Buffer.isBuffer(chunk) && this[ENCODING]) chunk = this[DECODER].write(chunk);
		if (this[FLOWING] && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
		if (this[FLOWING]) this.emit("data", chunk);
		else this[BUFFERPUSH](chunk);
		if (this[BUFFERLENGTH] !== 0) this.emit("readable");
		if (cb) fn(cb);
		return this[FLOWING];
	}
	/**
	* Low-level explicit read method.
	*
	* In objectMode, the argument is ignored, and one item is returned if
	* available.
	*
	* `n` is the number of bytes (or in the case of encoding streams,
	* characters) to consume. If `n` is not provided, then the entire buffer
	* is returned, or `null` is returned if no data is available.
	*
	* If `n` is greater that the amount of data in the internal buffer,
	* then `null` is returned.
	*/
	read(n) {
		if (this[DESTROYED]) return null;
		this[DISCARDED] = false;
		if (this[BUFFERLENGTH] === 0 || n === 0 || n && n > this[BUFFERLENGTH]) {
			this[MAYBE_EMIT_END]();
			return null;
		}
		if (this[OBJECTMODE]) n = null;
		if (this[BUFFER].length > 1 && !this[OBJECTMODE]) this[BUFFER] = [this[ENCODING] ? this[BUFFER].join("") : Buffer.concat(this[BUFFER], this[BUFFERLENGTH])];
		const ret = this[READ](n || null, this[BUFFER][0]);
		this[MAYBE_EMIT_END]();
		return ret;
	}
	[READ](n, chunk) {
		if (this[OBJECTMODE]) this[BUFFERSHIFT]();
		else {
			const c = chunk;
			if (n === c.length || n === null) this[BUFFERSHIFT]();
			else if (typeof c === "string") {
				this[BUFFER][0] = c.slice(n);
				chunk = c.slice(0, n);
				this[BUFFERLENGTH] -= n;
			} else {
				this[BUFFER][0] = c.subarray(n);
				chunk = c.subarray(0, n);
				this[BUFFERLENGTH] -= n;
			}
		}
		this.emit("data", chunk);
		if (!this[BUFFER].length && !this[EOF]) this.emit("drain");
		return chunk;
	}
	end(chunk, encoding, cb) {
		if (typeof chunk === "function") {
			cb = chunk;
			chunk = void 0;
		}
		if (typeof encoding === "function") {
			cb = encoding;
			encoding = "utf8";
		}
		if (chunk !== void 0) this.write(chunk, encoding);
		if (cb) this.once("end", cb);
		this[EOF] = true;
		this.writable = false;
		if (this[FLOWING] || !this[PAUSED]) this[MAYBE_EMIT_END]();
		return this;
	}
	[RESUME]() {
		if (this[DESTROYED]) return;
		if (!this[DATALISTENERS] && !this[PIPES].length) this[DISCARDED] = true;
		this[PAUSED] = false;
		this[FLOWING] = true;
		this.emit("resume");
		if (this[BUFFER].length) this[FLUSH]();
		else if (this[EOF]) this[MAYBE_EMIT_END]();
		else this.emit("drain");
	}
	/**
	* Resume the stream if it is currently in a paused state
	*
	* If called when there are no pipe destinations or `data` event listeners,
	* this will place the stream in a "discarded" state, where all data will
	* be thrown away. The discarded state is removed if a pipe destination or
	* data handler is added, if pause() is called, or if any synchronous or
	* asynchronous iteration is started.
	*/
	resume() {
		return this[RESUME]();
	}
	/**
	* Pause the stream
	*/
	pause() {
		this[FLOWING] = false;
		this[PAUSED] = true;
		this[DISCARDED] = false;
	}
	/**
	* true if the stream has been forcibly destroyed
	*/
	get destroyed() {
		return this[DESTROYED];
	}
	/**
	* true if the stream is currently in a flowing state, meaning that
	* any writes will be immediately emitted.
	*/
	get flowing() {
		return this[FLOWING];
	}
	/**
	* true if the stream is currently in a paused state
	*/
	get paused() {
		return this[PAUSED];
	}
	[BUFFERPUSH](chunk) {
		if (this[OBJECTMODE]) this[BUFFERLENGTH] += 1;
		else this[BUFFERLENGTH] += chunk.length;
		this[BUFFER].push(chunk);
	}
	[BUFFERSHIFT]() {
		if (this[OBJECTMODE]) this[BUFFERLENGTH] -= 1;
		else this[BUFFERLENGTH] -= this[BUFFER][0].length;
		return this[BUFFER].shift();
	}
	[FLUSH](noDrain = false) {
		do		;
while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
		if (!noDrain && !this[BUFFER].length && !this[EOF]) this.emit("drain");
	}
	[FLUSHCHUNK](chunk) {
		this.emit("data", chunk);
		return this[FLOWING];
	}
	/**
	* Pipe all data emitted by this stream into the destination provided.
	*
	* Triggers the flow of data.
	*/
	pipe(dest, opts) {
		if (this[DESTROYED]) return dest;
		this[DISCARDED] = false;
		const ended = this[EMITTED_END];
		opts = opts || {};
		if (dest === proc.stdout || dest === proc.stderr) opts.end = false;
		else opts.end = opts.end !== false;
		opts.proxyErrors = !!opts.proxyErrors;
		if (ended) {
			if (opts.end) dest.end();
		} else {
			this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
			if (this[ASYNC]) defer(() => this[RESUME]());
			else this[RESUME]();
		}
		return dest;
	}
	/**
	* Fully unhook a piped destination stream.
	*
	* If the destination stream was the only consumer of this stream (ie,
	* there are no other piped destinations or `'data'` event listeners)
	* then the flow of data will stop until there is another consumer or
	* {@link Minipass#resume} is explicitly called.
	*/
	unpipe(dest) {
		const p = this[PIPES].find((p$1) => p$1.dest === dest);
		if (p) {
			if (this[PIPES].length === 1) {
				if (this[FLOWING] && this[DATALISTENERS] === 0) this[FLOWING] = false;
				this[PIPES] = [];
			} else this[PIPES].splice(this[PIPES].indexOf(p), 1);
			p.unpipe();
		}
	}
	/**
	* Alias for {@link Minipass#on}
	*/
	addListener(ev, handler) {
		return this.on(ev, handler);
	}
	/**
	* Mostly identical to `EventEmitter.on`, with the following
	* behavior differences to prevent data loss and unnecessary hangs:
	*
	* - Adding a 'data' event handler will trigger the flow of data
	*
	* - Adding a 'readable' event handler when there is data waiting to be read
	*   will cause 'readable' to be emitted immediately.
	*
	* - Adding an 'endish' event handler ('end', 'finish', etc.) which has
	*   already passed will cause the event to be emitted immediately and all
	*   handlers removed.
	*
	* - Adding an 'error' event handler after an error has been emitted will
	*   cause the event to be re-emitted immediately with the error previously
	*   raised.
	*/
	on(ev, handler) {
		const ret = super.on(ev, handler);
		if (ev === "data") {
			this[DISCARDED] = false;
			this[DATALISTENERS]++;
			if (!this[PIPES].length && !this[FLOWING]) this[RESUME]();
		} else if (ev === "readable" && this[BUFFERLENGTH] !== 0) super.emit("readable");
		else if (isEndish(ev) && this[EMITTED_END]) {
			super.emit(ev);
			this.removeAllListeners(ev);
		} else if (ev === "error" && this[EMITTED_ERROR]) {
			const h = handler;
			if (this[ASYNC]) defer(() => h.call(this, this[EMITTED_ERROR]));
			else h.call(this, this[EMITTED_ERROR]);
		}
		return ret;
	}
	/**
	* Alias for {@link Minipass#off}
	*/
	removeListener(ev, handler) {
		return this.off(ev, handler);
	}
	/**
	* Mostly identical to `EventEmitter.off`
	*
	* If a 'data' event handler is removed, and it was the last consumer
	* (ie, there are no pipe destinations or other 'data' event listeners),
	* then the flow of data will stop until there is another consumer or
	* {@link Minipass#resume} is explicitly called.
	*/
	off(ev, handler) {
		const ret = super.off(ev, handler);
		if (ev === "data") {
			this[DATALISTENERS] = this.listeners("data").length;
			if (this[DATALISTENERS] === 0 && !this[DISCARDED] && !this[PIPES].length) this[FLOWING] = false;
		}
		return ret;
	}
	/**
	* Mostly identical to `EventEmitter.removeAllListeners`
	*
	* If all 'data' event handlers are removed, and they were the last consumer
	* (ie, there are no pipe destinations), then the flow of data will stop
	* until there is another consumer or {@link Minipass#resume} is explicitly
	* called.
	*/
	removeAllListeners(ev) {
		const ret = super.removeAllListeners(ev);
		if (ev === "data" || ev === void 0) {
			this[DATALISTENERS] = 0;
			if (!this[DISCARDED] && !this[PIPES].length) this[FLOWING] = false;
		}
		return ret;
	}
	/**
	* true if the 'end' event has been emitted
	*/
	get emittedEnd() {
		return this[EMITTED_END];
	}
	[MAYBE_EMIT_END]() {
		if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
			this[EMITTING_END] = true;
			this.emit("end");
			this.emit("prefinish");
			this.emit("finish");
			if (this[CLOSED]) this.emit("close");
			this[EMITTING_END] = false;
		}
	}
	/**
	* Mostly identical to `EventEmitter.emit`, with the following
	* behavior differences to prevent data loss and unnecessary hangs:
	*
	* If the stream has been destroyed, and the event is something other
	* than 'close' or 'error', then `false` is returned and no handlers
	* are called.
	*
	* If the event is 'end', and has already been emitted, then the event
	* is ignored. If the stream is in a paused or non-flowing state, then
	* the event will be deferred until data flow resumes. If the stream is
	* async, then handlers will be called on the next tick rather than
	* immediately.
	*
	* If the event is 'close', and 'end' has not yet been emitted, then
	* the event will be deferred until after 'end' is emitted.
	*
	* If the event is 'error', and an AbortSignal was provided for the stream,
	* and there are no listeners, then the event is ignored, matching the
	* behavior of node core streams in the presense of an AbortSignal.
	*
	* If the event is 'finish' or 'prefinish', then all listeners will be
	* removed after emitting the event, to prevent double-firing.
	*/
	emit(ev, ...args) {
		const data = args[0];
		if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) return false;
		else if (ev === "data") return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? (defer(() => this[EMITDATA](data)), true) : this[EMITDATA](data);
		else if (ev === "end") return this[EMITEND]();
		else if (ev === "close") {
			this[CLOSED] = true;
			if (!this[EMITTED_END] && !this[DESTROYED]) return false;
			const ret$1 = super.emit("close");
			this.removeAllListeners("close");
			return ret$1;
		} else if (ev === "error") {
			this[EMITTED_ERROR] = data;
			super.emit(ERROR, data);
			const ret$1 = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
			this[MAYBE_EMIT_END]();
			return ret$1;
		} else if (ev === "resume") {
			const ret$1 = super.emit("resume");
			this[MAYBE_EMIT_END]();
			return ret$1;
		} else if (ev === "finish" || ev === "prefinish") {
			const ret$1 = super.emit(ev);
			this.removeAllListeners(ev);
			return ret$1;
		}
		const ret = super.emit(ev, ...args);
		this[MAYBE_EMIT_END]();
		return ret;
	}
	[EMITDATA](data) {
		for (const p of this[PIPES]) if (p.dest.write(data) === false) this.pause();
		const ret = this[DISCARDED] ? false : super.emit("data", data);
		this[MAYBE_EMIT_END]();
		return ret;
	}
	[EMITEND]() {
		if (this[EMITTED_END]) return false;
		this[EMITTED_END] = true;
		this.readable = false;
		return this[ASYNC] ? (defer(() => this[EMITEND2]()), true) : this[EMITEND2]();
	}
	[EMITEND2]() {
		if (this[DECODER]) {
			const data = this[DECODER].end();
			if (data) {
				for (const p of this[PIPES]) p.dest.write(data);
				if (!this[DISCARDED]) super.emit("data", data);
			}
		}
		for (const p of this[PIPES]) p.end();
		const ret = super.emit("end");
		this.removeAllListeners("end");
		return ret;
	}
	/**
	* Return a Promise that resolves to an array of all emitted data once
	* the stream ends.
	*/
	async collect() {
		const buf = Object.assign([], { dataLength: 0 });
		if (!this[OBJECTMODE]) buf.dataLength = 0;
		const p = this.promise();
		this.on("data", (c) => {
			buf.push(c);
			if (!this[OBJECTMODE]) buf.dataLength += c.length;
		});
		await p;
		return buf;
	}
	/**
	* Return a Promise that resolves to the concatenation of all emitted data
	* once the stream ends.
	*
	* Not allowed on objectMode streams.
	*/
	async concat() {
		if (this[OBJECTMODE]) throw new Error("cannot concat in objectMode");
		const buf = await this.collect();
		return this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength);
	}
	/**
	* Return a void Promise that resolves once the stream ends.
	*/
	async promise() {
		return new Promise((resolve$2, reject) => {
			this.on(DESTROYED, () => reject(/* @__PURE__ */ new Error("stream destroyed")));
			this.on("error", (er) => reject(er));
			this.on("end", () => resolve$2());
		});
	}
	/**
	* Asynchronous `for await of` iteration.
	*
	* This will continue emitting all chunks until the stream terminates.
	*/
	[Symbol.asyncIterator]() {
		this[DISCARDED] = false;
		let stopped = false;
		const stop = async () => {
			this.pause();
			stopped = true;
			return {
				value: void 0,
				done: true
			};
		};
		const next = () => {
			if (stopped) return stop();
			const res = this.read();
			if (res !== null) return Promise.resolve({
				done: false,
				value: res
			});
			if (this[EOF]) return stop();
			let resolve$2;
			let reject;
			const onerr = (er) => {
				this.off("data", ondata);
				this.off("end", onend);
				this.off(DESTROYED, ondestroy);
				stop();
				reject(er);
			};
			const ondata = (value) => {
				this.off("error", onerr);
				this.off("end", onend);
				this.off(DESTROYED, ondestroy);
				this.pause();
				resolve$2({
					value,
					done: !!this[EOF]
				});
			};
			const onend = () => {
				this.off("error", onerr);
				this.off("data", ondata);
				this.off(DESTROYED, ondestroy);
				stop();
				resolve$2({
					done: true,
					value: void 0
				});
			};
			const ondestroy = () => onerr(/* @__PURE__ */ new Error("stream destroyed"));
			return new Promise((res$1, rej) => {
				reject = rej;
				resolve$2 = res$1;
				this.once(DESTROYED, ondestroy);
				this.once("error", onerr);
				this.once("end", onend);
				this.once("data", ondata);
			});
		};
		return {
			next,
			throw: stop,
			return: stop,
			[Symbol.asyncIterator]() {
				return this;
			}
		};
	}
	/**
	* Synchronous `for of` iteration.
	*
	* The iteration will terminate when the internal buffer runs out, even
	* if the stream has not yet terminated.
	*/
	[Symbol.iterator]() {
		this[DISCARDED] = false;
		let stopped = false;
		const stop = () => {
			this.pause();
			this.off(ERROR, stop);
			this.off(DESTROYED, stop);
			this.off("end", stop);
			stopped = true;
			return {
				done: true,
				value: void 0
			};
		};
		const next = () => {
			if (stopped) return stop();
			const value = this.read();
			return value === null ? stop() : {
				done: false,
				value
			};
		};
		this.once("end", stop);
		this.once(ERROR, stop);
		this.once(DESTROYED, stop);
		return {
			next,
			throw: stop,
			return: stop,
			[Symbol.iterator]() {
				return this;
			}
		};
	}
	/**
	* Destroy a stream, preventing it from being used for any further purpose.
	*
	* If the stream has a `close()` method, then it will be called on
	* destruction.
	*
	* After destruction, any attempt to write data, read data, or emit most
	* events will be ignored.
	*
	* If an error argument is provided, then it will be emitted in an
	* 'error' event.
	*/
	destroy(er) {
		if (this[DESTROYED]) {
			if (er) this.emit("error", er);
			else this.emit(DESTROYED);
			return this;
		}
		this[DESTROYED] = true;
		this[DISCARDED] = true;
		this[BUFFER].length = 0;
		this[BUFFERLENGTH] = 0;
		const wc = this;
		if (typeof wc.close === "function" && !this[CLOSED]) wc.close();
		if (er) this.emit("error", er);
		else this.emit(DESTROYED);
		return this;
	}
	/**
	* Alias for {@link isStream}
	*
	* Former export location, maintained for backwards compatibility.
	*
	* @deprecated
	*/
	static get isStream() {
		return isStream;
	}
};

//#endregion
//#region node_modules/path-scurry/dist/esm/index.js
const realpathSync$1 = realpathSync.native;
const defaultFS = {
	lstatSync,
	readdir,
	readdirSync,
	readlinkSync,
	realpathSync: realpathSync$1,
	promises: {
		lstat,
		readdir: readdir$1,
		readlink,
		realpath
	}
};
const fsFromOption = (fsOption) => !fsOption || fsOption === defaultFS || fsOption === actualFS ? defaultFS : {
	...defaultFS,
	...fsOption,
	promises: {
		...defaultFS.promises,
		...fsOption.promises || {}
	}
};
const uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
const uncToDrive = (rootPath) => rootPath.replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
const eitherSep = /[\\\/]/;
const UNKNOWN = 0;
const IFIFO = 1;
const IFCHR = 2;
const IFDIR = 4;
const IFBLK = 6;
const IFREG = 8;
const IFLNK = 10;
const IFSOCK = 12;
const IFMT = 15;
const IFMT_UNKNOWN = ~IFMT;
const READDIR_CALLED = 16;
const LSTAT_CALLED = 32;
const ENOTDIR = 64;
const ENOENT = 128;
const ENOREADLINK = 256;
const ENOREALPATH = 512;
const ENOCHILD = ENOENT | 576;
const TYPEMASK = 1023;
const entToType = (s) => s.isFile() ? IFREG : s.isDirectory() ? IFDIR : s.isSymbolicLink() ? IFLNK : s.isCharacterDevice() ? IFCHR : s.isBlockDevice() ? IFBLK : s.isSocket() ? IFSOCK : s.isFIFO() ? IFIFO : UNKNOWN;
const normalizeCache = /* @__PURE__ */ new Map();
const normalize = (s) => {
	const c = normalizeCache.get(s);
	if (c) return c;
	const n = s.normalize("NFKD");
	normalizeCache.set(s, n);
	return n;
};
const normalizeNocaseCache = /* @__PURE__ */ new Map();
const normalizeNocase = (s) => {
	const c = normalizeNocaseCache.get(s);
	if (c) return c;
	const n = normalize(s.toLowerCase());
	normalizeNocaseCache.set(s, n);
	return n;
};
/**
* An LRUCache for storing resolved path strings or Path objects.
* @internal
*/
var ResolveCache = class extends LRUCache {
	constructor() {
		super({ max: 256 });
	}
};
/**
* an LRUCache for storing child entries.
* @internal
*/
var ChildrenCache = class extends LRUCache {
	constructor(maxSize = 16 * 1024) {
		super({
			maxSize,
			sizeCalculation: (a) => a.length + 1
		});
	}
};
const setAsCwd = Symbol("PathScurry setAsCwd");
/**
* Path objects are sort of like a super-powered
* {@link https://nodejs.org/docs/latest/api/fs.html#class-fsdirent fs.Dirent}
*
* Each one represents a single filesystem entry on disk, which may or may not
* exist. It includes methods for reading various types of information via
* lstat, readlink, and readdir, and caches all information to the greatest
* degree possible.
*
* Note that fs operations that would normally throw will instead return an
* "empty" value. This is in order to prevent excessive overhead from error
* stack traces.
*/
var PathBase = class {
	/**
	* the basename of this path
	*
	* **Important**: *always* test the path name against any test string
	* usingthe {@link isNamed} method, and not by directly comparing this
	* string. Otherwise, unicode path strings that the system sees as identical
	* will not be properly treated as the same path, leading to incorrect
	* behavior and possible security issues.
	*/
	name;
	/**
	* the Path entry corresponding to the path root.
	*
	* @internal
	*/
	root;
	/**
	* All roots found within the current PathScurry family
	*
	* @internal
	*/
	roots;
	/**
	* a reference to the parent path, or undefined in the case of root entries
	*
	* @internal
	*/
	parent;
	/**
	* boolean indicating whether paths are compared case-insensitively
	* @internal
	*/
	nocase;
	/**
	* boolean indicating that this path is the current working directory
	* of the PathScurry collection that contains it.
	*/
	isCWD = false;
	#fs;
	#dev;
	get dev() {
		return this.#dev;
	}
	#mode;
	get mode() {
		return this.#mode;
	}
	#nlink;
	get nlink() {
		return this.#nlink;
	}
	#uid;
	get uid() {
		return this.#uid;
	}
	#gid;
	get gid() {
		return this.#gid;
	}
	#rdev;
	get rdev() {
		return this.#rdev;
	}
	#blksize;
	get blksize() {
		return this.#blksize;
	}
	#ino;
	get ino() {
		return this.#ino;
	}
	#size;
	get size() {
		return this.#size;
	}
	#blocks;
	get blocks() {
		return this.#blocks;
	}
	#atimeMs;
	get atimeMs() {
		return this.#atimeMs;
	}
	#mtimeMs;
	get mtimeMs() {
		return this.#mtimeMs;
	}
	#ctimeMs;
	get ctimeMs() {
		return this.#ctimeMs;
	}
	#birthtimeMs;
	get birthtimeMs() {
		return this.#birthtimeMs;
	}
	#atime;
	get atime() {
		return this.#atime;
	}
	#mtime;
	get mtime() {
		return this.#mtime;
	}
	#ctime;
	get ctime() {
		return this.#ctime;
	}
	#birthtime;
	get birthtime() {
		return this.#birthtime;
	}
	#matchName;
	#depth;
	#fullpath;
	#fullpathPosix;
	#relative;
	#relativePosix;
	#type;
	#children;
	#linkTarget;
	#realpath;
	/**
	* This property is for compatibility with the Dirent class as of
	* Node v20, where Dirent['parentPath'] refers to the path of the
	* directory that was passed to readdir. For root entries, it's the path
	* to the entry itself.
	*/
	get parentPath() {
		return (this.parent || this).fullpath();
	}
	/**
	* Deprecated alias for Dirent['parentPath'] Somewhat counterintuitively,
	* this property refers to the *parent* path, not the path object itself.
	*
	* @deprecated
	*/
	get path() {
		return this.parentPath;
	}
	/**
	* Do not create new Path objects directly.  They should always be accessed
	* via the PathScurry class or other methods on the Path class.
	*
	* @internal
	*/
	constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
		this.name = name;
		this.#matchName = nocase ? normalizeNocase(name) : normalize(name);
		this.#type = type & TYPEMASK;
		this.nocase = nocase;
		this.roots = roots;
		this.root = root || this;
		this.#children = children;
		this.#fullpath = opts.fullpath;
		this.#relative = opts.relative;
		this.#relativePosix = opts.relativePosix;
		this.parent = opts.parent;
		if (this.parent) this.#fs = this.parent.#fs;
		else this.#fs = fsFromOption(opts.fs);
	}
	/**
	* Returns the depth of the Path object from its root.
	*
	* For example, a path at `/foo/bar` would have a depth of 2.
	*/
	depth() {
		if (this.#depth !== void 0) return this.#depth;
		if (!this.parent) return this.#depth = 0;
		return this.#depth = this.parent.depth() + 1;
	}
	/**
	* @internal
	*/
	childrenCache() {
		return this.#children;
	}
	/**
	* Get the Path object referenced by the string path, resolved from this Path
	*/
	resolve(path$2) {
		if (!path$2) return this;
		const rootPath = this.getRootString(path$2);
		const dirParts = path$2.substring(rootPath.length).split(this.splitSep);
		return rootPath ? this.getRoot(rootPath).#resolveParts(dirParts) : this.#resolveParts(dirParts);
	}
	#resolveParts(dirParts) {
		let p = this;
		for (const part of dirParts) p = p.child(part);
		return p;
	}
	/**
	* Returns the cached children Path objects, if still available.  If they
	* have fallen out of the cache, then returns an empty array, and resets the
	* READDIR_CALLED bit, so that future calls to readdir() will require an fs
	* lookup.
	*
	* @internal
	*/
	children() {
		const cached = this.#children.get(this);
		if (cached) return cached;
		const children = Object.assign([], { provisional: 0 });
		this.#children.set(this, children);
		this.#type &= ~READDIR_CALLED;
		return children;
	}
	/**
	* Resolves a path portion and returns or creates the child Path.
	*
	* Returns `this` if pathPart is `''` or `'.'`, or `parent` if pathPart is
	* `'..'`.
	*
	* This should not be called directly.  If `pathPart` contains any path
	* separators, it will lead to unsafe undefined behavior.
	*
	* Use `Path.resolve()` instead.
	*
	* @internal
	*/
	child(pathPart, opts) {
		if (pathPart === "" || pathPart === ".") return this;
		if (pathPart === "..") return this.parent || this;
		const children = this.children();
		const name = this.nocase ? normalizeNocase(pathPart) : normalize(pathPart);
		for (const p of children) if (p.#matchName === name) return p;
		const s = this.parent ? this.sep : "";
		const fullpath = this.#fullpath ? this.#fullpath + s + pathPart : void 0;
		const pchild = this.newChild(pathPart, UNKNOWN, {
			...opts,
			parent: this,
			fullpath
		});
		if (!this.canReaddir()) pchild.#type |= ENOENT;
		children.push(pchild);
		return pchild;
	}
	/**
	* The relative path from the cwd. If it does not share an ancestor with
	* the cwd, then this ends up being equivalent to the fullpath()
	*/
	relative() {
		if (this.isCWD) return "";
		if (this.#relative !== void 0) return this.#relative;
		const name = this.name;
		const p = this.parent;
		if (!p) return this.#relative = this.name;
		const pv = p.relative();
		return pv + (!pv || !p.parent ? "" : this.sep) + name;
	}
	/**
	* The relative path from the cwd, using / as the path separator.
	* If it does not share an ancestor with
	* the cwd, then this ends up being equivalent to the fullpathPosix()
	* On posix systems, this is identical to relative().
	*/
	relativePosix() {
		if (this.sep === "/") return this.relative();
		if (this.isCWD) return "";
		if (this.#relativePosix !== void 0) return this.#relativePosix;
		const name = this.name;
		const p = this.parent;
		if (!p) return this.#relativePosix = this.fullpathPosix();
		const pv = p.relativePosix();
		return pv + (!pv || !p.parent ? "" : "/") + name;
	}
	/**
	* The fully resolved path string for this Path entry
	*/
	fullpath() {
		if (this.#fullpath !== void 0) return this.#fullpath;
		const name = this.name;
		const p = this.parent;
		if (!p) return this.#fullpath = this.name;
		return this.#fullpath = p.fullpath() + (!p.parent ? "" : this.sep) + name;
	}
	/**
	* On platforms other than windows, this is identical to fullpath.
	*
	* On windows, this is overridden to return the forward-slash form of the
	* full UNC path.
	*/
	fullpathPosix() {
		if (this.#fullpathPosix !== void 0) return this.#fullpathPosix;
		if (this.sep === "/") return this.#fullpathPosix = this.fullpath();
		if (!this.parent) {
			const p$1 = this.fullpath().replace(/\\/g, "/");
			if (/^[a-z]:\//i.test(p$1)) return this.#fullpathPosix = `//?/${p$1}`;
			else return this.#fullpathPosix = p$1;
		}
		const p = this.parent;
		const pfpp = p.fullpathPosix();
		return this.#fullpathPosix = pfpp + (!pfpp || !p.parent ? "" : "/") + this.name;
	}
	/**
	* Is the Path of an unknown type?
	*
	* Note that we might know *something* about it if there has been a previous
	* filesystem operation, for example that it does not exist, or is not a
	* link, or whether it has child entries.
	*/
	isUnknown() {
		return (this.#type & IFMT) === UNKNOWN;
	}
	isType(type) {
		return this[`is${type}`]();
	}
	getType() {
		return this.isUnknown() ? "Unknown" : this.isDirectory() ? "Directory" : this.isFile() ? "File" : this.isSymbolicLink() ? "SymbolicLink" : this.isFIFO() ? "FIFO" : this.isCharacterDevice() ? "CharacterDevice" : this.isBlockDevice() ? "BlockDevice" : this.isSocket() ? "Socket" : "Unknown";
		/* c8 ignore stop */
	}
	/**
	* Is the Path a regular file?
	*/
	isFile() {
		return (this.#type & IFMT) === IFREG;
	}
	/**
	* Is the Path a directory?
	*/
	isDirectory() {
		return (this.#type & IFMT) === IFDIR;
	}
	/**
	* Is the path a character device?
	*/
	isCharacterDevice() {
		return (this.#type & IFMT) === IFCHR;
	}
	/**
	* Is the path a block device?
	*/
	isBlockDevice() {
		return (this.#type & IFMT) === IFBLK;
	}
	/**
	* Is the path a FIFO pipe?
	*/
	isFIFO() {
		return (this.#type & IFMT) === IFIFO;
	}
	/**
	* Is the path a socket?
	*/
	isSocket() {
		return (this.#type & IFMT) === IFSOCK;
	}
	/**
	* Is the path a symbolic link?
	*/
	isSymbolicLink() {
		return (this.#type & IFLNK) === IFLNK;
	}
	/**
	* Return the entry if it has been subject of a successful lstat, or
	* undefined otherwise.
	*
	* Does not read the filesystem, so an undefined result *could* simply
	* mean that we haven't called lstat on it.
	*/
	lstatCached() {
		return this.#type & LSTAT_CALLED ? this : void 0;
	}
	/**
	* Return the cached link target if the entry has been the subject of a
	* successful readlink, or undefined otherwise.
	*
	* Does not read the filesystem, so an undefined result *could* just mean we
	* don't have any cached data. Only use it if you are very sure that a
	* readlink() has been called at some point.
	*/
	readlinkCached() {
		return this.#linkTarget;
	}
	/**
	* Returns the cached realpath target if the entry has been the subject
	* of a successful realpath, or undefined otherwise.
	*
	* Does not read the filesystem, so an undefined result *could* just mean we
	* don't have any cached data. Only use it if you are very sure that a
	* realpath() has been called at some point.
	*/
	realpathCached() {
		return this.#realpath;
	}
	/**
	* Returns the cached child Path entries array if the entry has been the
	* subject of a successful readdir(), or [] otherwise.
	*
	* Does not read the filesystem, so an empty array *could* just mean we
	* don't have any cached data. Only use it if you are very sure that a
	* readdir() has been called recently enough to still be valid.
	*/
	readdirCached() {
		const children = this.children();
		return children.slice(0, children.provisional);
	}
	/**
	* Return true if it's worth trying to readlink.  Ie, we don't (yet) have
	* any indication that readlink will definitely fail.
	*
	* Returns false if the path is known to not be a symlink, if a previous
	* readlink failed, or if the entry does not exist.
	*/
	canReadlink() {
		if (this.#linkTarget) return true;
		if (!this.parent) return false;
		const ifmt = this.#type & IFMT;
		return !(ifmt !== UNKNOWN && ifmt !== IFLNK || this.#type & ENOREADLINK || this.#type & ENOENT);
	}
	/**
	* Return true if readdir has previously been successfully called on this
	* path, indicating that cachedReaddir() is likely valid.
	*/
	calledReaddir() {
		return !!(this.#type & READDIR_CALLED);
	}
	/**
	* Returns true if the path is known to not exist. That is, a previous lstat
	* or readdir failed to verify its existence when that would have been
	* expected, or a parent entry was marked either enoent or enotdir.
	*/
	isENOENT() {
		return !!(this.#type & ENOENT);
	}
	/**
	* Return true if the path is a match for the given path name.  This handles
	* case sensitivity and unicode normalization.
	*
	* Note: even on case-sensitive systems, it is **not** safe to test the
	* equality of the `.name` property to determine whether a given pathname
	* matches, due to unicode normalization mismatches.
	*
	* Always use this method instead of testing the `path.name` property
	* directly.
	*/
	isNamed(n) {
		return !this.nocase ? this.#matchName === normalize(n) : this.#matchName === normalizeNocase(n);
	}
	/**
	* Return the Path object corresponding to the target of a symbolic link.
	*
	* If the Path is not a symbolic link, or if the readlink call fails for any
	* reason, `undefined` is returned.
	*
	* Result is cached, and thus may be outdated if the filesystem is mutated.
	*/
	async readlink() {
		const target = this.#linkTarget;
		if (target) return target;
		if (!this.canReadlink()) return;
		/* c8 ignore start */
		if (!this.parent) return;
		/* c8 ignore stop */
		try {
			const read = await this.#fs.promises.readlink(this.fullpath());
			const linkTarget = (await this.parent.realpath())?.resolve(read);
			if (linkTarget) return this.#linkTarget = linkTarget;
		} catch (er) {
			this.#readlinkFail(er.code);
			return;
		}
	}
	/**
	* Synchronous {@link PathBase.readlink}
	*/
	readlinkSync() {
		const target = this.#linkTarget;
		if (target) return target;
		if (!this.canReadlink()) return;
		/* c8 ignore start */
		if (!this.parent) return;
		/* c8 ignore stop */
		try {
			const read = this.#fs.readlinkSync(this.fullpath());
			const linkTarget = this.parent.realpathSync()?.resolve(read);
			if (linkTarget) return this.#linkTarget = linkTarget;
		} catch (er) {
			this.#readlinkFail(er.code);
			return;
		}
	}
	#readdirSuccess(children) {
		this.#type |= READDIR_CALLED;
		for (let p = children.provisional; p < children.length; p++) {
			const c = children[p];
			if (c) c.#markENOENT();
		}
	}
	#markENOENT() {
		if (this.#type & ENOENT) return;
		this.#type = (this.#type | ENOENT) & IFMT_UNKNOWN;
		this.#markChildrenENOENT();
	}
	#markChildrenENOENT() {
		const children = this.children();
		children.provisional = 0;
		for (const p of children) p.#markENOENT();
	}
	#markENOREALPATH() {
		this.#type |= ENOREALPATH;
		this.#markENOTDIR();
	}
	#markENOTDIR() {
		/* c8 ignore start */
		if (this.#type & ENOTDIR) return;
		/* c8 ignore stop */
		let t = this.#type;
		if ((t & IFMT) === IFDIR) t &= IFMT_UNKNOWN;
		this.#type = t | ENOTDIR;
		this.#markChildrenENOENT();
	}
	#readdirFail(code = "") {
		if (code === "ENOTDIR" || code === "EPERM") this.#markENOTDIR();
		else if (code === "ENOENT") this.#markENOENT();
		else this.children().provisional = 0;
	}
	#lstatFail(code = "") {
		/* c8 ignore start */
		if (code === "ENOTDIR") this.parent.#markENOTDIR();
		else if (code === "ENOENT")
 /* c8 ignore stop */
		this.#markENOENT();
	}
	#readlinkFail(code = "") {
		let ter = this.#type;
		ter |= ENOREADLINK;
		if (code === "ENOENT") ter |= ENOENT;
		if (code === "EINVAL" || code === "UNKNOWN") ter &= IFMT_UNKNOWN;
		this.#type = ter;
		/* c8 ignore start */
		if (code === "ENOTDIR" && this.parent) this.parent.#markENOTDIR();
		/* c8 ignore stop */
	}
	#readdirAddChild(e, c) {
		return this.#readdirMaybePromoteChild(e, c) || this.#readdirAddNewChild(e, c);
	}
	#readdirAddNewChild(e, c) {
		const type = entToType(e);
		const child = this.newChild(e.name, type, { parent: this });
		const ifmt = child.#type & IFMT;
		if (ifmt !== IFDIR && ifmt !== IFLNK && ifmt !== UNKNOWN) child.#type |= ENOTDIR;
		c.unshift(child);
		c.provisional++;
		return child;
	}
	#readdirMaybePromoteChild(e, c) {
		for (let p = c.provisional; p < c.length; p++) {
			const pchild = c[p];
			if ((this.nocase ? normalizeNocase(e.name) : normalize(e.name)) !== pchild.#matchName) continue;
			return this.#readdirPromoteChild(e, pchild, p, c);
		}
	}
	#readdirPromoteChild(e, p, index, c) {
		const v = p.name;
		p.#type = p.#type & IFMT_UNKNOWN | entToType(e);
		if (v !== e.name) p.name = e.name;
		if (index !== c.provisional) {
			if (index === c.length - 1) c.pop();
			else c.splice(index, 1);
			c.unshift(p);
		}
		c.provisional++;
		return p;
	}
	/**
	* Call lstat() on this Path, and update all known information that can be
	* determined.
	*
	* Note that unlike `fs.lstat()`, the returned value does not contain some
	* information, such as `mode`, `dev`, `nlink`, and `ino`.  If that
	* information is required, you will need to call `fs.lstat` yourself.
	*
	* If the Path refers to a nonexistent file, or if the lstat call fails for
	* any reason, `undefined` is returned.  Otherwise the updated Path object is
	* returned.
	*
	* Results are cached, and thus may be out of date if the filesystem is
	* mutated.
	*/
	async lstat() {
		if ((this.#type & ENOENT) === 0) try {
			this.#applyStat(await this.#fs.promises.lstat(this.fullpath()));
			return this;
		} catch (er) {
			this.#lstatFail(er.code);
		}
	}
	/**
	* synchronous {@link PathBase.lstat}
	*/
	lstatSync() {
		if ((this.#type & ENOENT) === 0) try {
			this.#applyStat(this.#fs.lstatSync(this.fullpath()));
			return this;
		} catch (er) {
			this.#lstatFail(er.code);
		}
	}
	#applyStat(st) {
		const { atime, atimeMs, birthtime, birthtimeMs, blksize, blocks, ctime, ctimeMs, dev, gid, ino, mode, mtime, mtimeMs, nlink, rdev, size, uid } = st;
		this.#atime = atime;
		this.#atimeMs = atimeMs;
		this.#birthtime = birthtime;
		this.#birthtimeMs = birthtimeMs;
		this.#blksize = blksize;
		this.#blocks = blocks;
		this.#ctime = ctime;
		this.#ctimeMs = ctimeMs;
		this.#dev = dev;
		this.#gid = gid;
		this.#ino = ino;
		this.#mode = mode;
		this.#mtime = mtime;
		this.#mtimeMs = mtimeMs;
		this.#nlink = nlink;
		this.#rdev = rdev;
		this.#size = size;
		this.#uid = uid;
		const ifmt = entToType(st);
		this.#type = this.#type & IFMT_UNKNOWN | ifmt | LSTAT_CALLED;
		if (ifmt !== UNKNOWN && ifmt !== IFDIR && ifmt !== IFLNK) this.#type |= ENOTDIR;
	}
	#onReaddirCB = [];
	#readdirCBInFlight = false;
	#callOnReaddirCB(children) {
		this.#readdirCBInFlight = false;
		const cbs = this.#onReaddirCB.slice();
		this.#onReaddirCB.length = 0;
		cbs.forEach((cb) => cb(null, children));
	}
	/**
	* Standard node-style callback interface to get list of directory entries.
	*
	* If the Path cannot or does not contain any children, then an empty array
	* is returned.
	*
	* Results are cached, and thus may be out of date if the filesystem is
	* mutated.
	*
	* @param cb The callback called with (er, entries).  Note that the `er`
	* param is somewhat extraneous, as all readdir() errors are handled and
	* simply result in an empty set of entries being returned.
	* @param allowZalgo Boolean indicating that immediately known results should
	* *not* be deferred with `queueMicrotask`. Defaults to `false`. Release
	* zalgo at your peril, the dark pony lord is devious and unforgiving.
	*/
	readdirCB(cb, allowZalgo = false) {
		if (!this.canReaddir()) {
			if (allowZalgo) cb(null, []);
			else queueMicrotask(() => cb(null, []));
			return;
		}
		const children = this.children();
		if (this.calledReaddir()) {
			const c = children.slice(0, children.provisional);
			if (allowZalgo) cb(null, c);
			else queueMicrotask(() => cb(null, c));
			return;
		}
		this.#onReaddirCB.push(cb);
		if (this.#readdirCBInFlight) return;
		this.#readdirCBInFlight = true;
		const fullpath = this.fullpath();
		this.#fs.readdir(fullpath, { withFileTypes: true }, (er, entries) => {
			if (er) {
				this.#readdirFail(er.code);
				children.provisional = 0;
			} else {
				for (const e of entries) this.#readdirAddChild(e, children);
				this.#readdirSuccess(children);
			}
			this.#callOnReaddirCB(children.slice(0, children.provisional));
		});
	}
	#asyncReaddirInFlight;
	/**
	* Return an array of known child entries.
	*
	* If the Path cannot or does not contain any children, then an empty array
	* is returned.
	*
	* Results are cached, and thus may be out of date if the filesystem is
	* mutated.
	*/
	async readdir() {
		if (!this.canReaddir()) return [];
		const children = this.children();
		if (this.calledReaddir()) return children.slice(0, children.provisional);
		const fullpath = this.fullpath();
		if (this.#asyncReaddirInFlight) await this.#asyncReaddirInFlight;
		else {
			/* c8 ignore start */
			let resolve$2 = () => {};
			/* c8 ignore stop */
			this.#asyncReaddirInFlight = new Promise((res) => resolve$2 = res);
			try {
				for (const e of await this.#fs.promises.readdir(fullpath, { withFileTypes: true })) this.#readdirAddChild(e, children);
				this.#readdirSuccess(children);
			} catch (er) {
				this.#readdirFail(er.code);
				children.provisional = 0;
			}
			this.#asyncReaddirInFlight = void 0;
			resolve$2();
		}
		return children.slice(0, children.provisional);
	}
	/**
	* synchronous {@link PathBase.readdir}
	*/
	readdirSync() {
		if (!this.canReaddir()) return [];
		const children = this.children();
		if (this.calledReaddir()) return children.slice(0, children.provisional);
		const fullpath = this.fullpath();
		try {
			for (const e of this.#fs.readdirSync(fullpath, { withFileTypes: true })) this.#readdirAddChild(e, children);
			this.#readdirSuccess(children);
		} catch (er) {
			this.#readdirFail(er.code);
			children.provisional = 0;
		}
		return children.slice(0, children.provisional);
	}
	canReaddir() {
		if (this.#type & ENOCHILD) return false;
		const ifmt = IFMT & this.#type;
		/* c8 ignore start */
		if (!(ifmt === UNKNOWN || ifmt === IFDIR || ifmt === IFLNK)) return false;
		/* c8 ignore stop */
		return true;
	}
	shouldWalk(dirs, walkFilter) {
		return (this.#type & IFDIR) === IFDIR && !(this.#type & ENOCHILD) && !dirs.has(this) && (!walkFilter || walkFilter(this));
	}
	/**
	* Return the Path object corresponding to path as resolved
	* by realpath(3).
	*
	* If the realpath call fails for any reason, `undefined` is returned.
	*
	* Result is cached, and thus may be outdated if the filesystem is mutated.
	* On success, returns a Path object.
	*/
	async realpath() {
		if (this.#realpath) return this.#realpath;
		if ((ENOREADLINK | 640) & this.#type) return void 0;
		try {
			const rp = await this.#fs.promises.realpath(this.fullpath());
			return this.#realpath = this.resolve(rp);
		} catch (_) {
			this.#markENOREALPATH();
		}
	}
	/**
	* Synchronous {@link realpath}
	*/
	realpathSync() {
		if (this.#realpath) return this.#realpath;
		if ((ENOREADLINK | 640) & this.#type) return void 0;
		try {
			const rp = this.#fs.realpathSync(this.fullpath());
			return this.#realpath = this.resolve(rp);
		} catch (_) {
			this.#markENOREALPATH();
		}
	}
	/**
	* Internal method to mark this Path object as the scurry cwd,
	* called by {@link PathScurry#chdir}
	*
	* @internal
	*/
	[setAsCwd](oldCwd) {
		if (oldCwd === this) return;
		oldCwd.isCWD = false;
		this.isCWD = true;
		const changed = /* @__PURE__ */ new Set([]);
		let rp = [];
		let p = this;
		while (p && p.parent) {
			changed.add(p);
			p.#relative = rp.join(this.sep);
			p.#relativePosix = rp.join("/");
			p = p.parent;
			rp.push("..");
		}
		p = oldCwd;
		while (p && p.parent && !changed.has(p)) {
			p.#relative = void 0;
			p.#relativePosix = void 0;
			p = p.parent;
		}
	}
};
/**
* Path class used on win32 systems
*
* Uses `'\\'` as the path separator for returned paths, either `'\\'` or `'/'`
* as the path separator for parsing paths.
*/
var PathWin32 = class PathWin32 extends PathBase {
	/**
	* Separator for generating path strings.
	*/
	sep = "\\";
	/**
	* Separator for parsing path strings.
	*/
	splitSep = eitherSep;
	/**
	* Do not create new Path objects directly.  They should always be accessed
	* via the PathScurry class or other methods on the Path class.
	*
	* @internal
	*/
	constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
		super(name, type, root, roots, nocase, children, opts);
	}
	/**
	* @internal
	*/
	newChild(name, type = UNKNOWN, opts = {}) {
		return new PathWin32(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
	}
	/**
	* @internal
	*/
	getRootString(path$2) {
		return win32.parse(path$2).root;
	}
	/**
	* @internal
	*/
	getRoot(rootPath) {
		rootPath = uncToDrive(rootPath.toUpperCase());
		if (rootPath === this.root.name) return this.root;
		for (const [compare, root] of Object.entries(this.roots)) if (this.sameRoot(rootPath, compare)) return this.roots[rootPath] = root;
		return this.roots[rootPath] = new PathScurryWin32(rootPath, this).root;
	}
	/**
	* @internal
	*/
	sameRoot(rootPath, compare = this.root.name) {
		rootPath = rootPath.toUpperCase().replace(/\//g, "\\").replace(uncDriveRegexp, "$1\\");
		return rootPath === compare;
	}
};
/**
* Path class used on all posix systems.
*
* Uses `'/'` as the path separator.
*/
var PathPosix = class PathPosix extends PathBase {
	/**
	* separator for parsing path strings
	*/
	splitSep = "/";
	/**
	* separator for generating path strings
	*/
	sep = "/";
	/**
	* Do not create new Path objects directly.  They should always be accessed
	* via the PathScurry class or other methods on the Path class.
	*
	* @internal
	*/
	constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
		super(name, type, root, roots, nocase, children, opts);
	}
	/**
	* @internal
	*/
	getRootString(path$2) {
		return path$2.startsWith("/") ? "/" : "";
	}
	/**
	* @internal
	*/
	getRoot(_rootPath) {
		return this.root;
	}
	/**
	* @internal
	*/
	newChild(name, type = UNKNOWN, opts = {}) {
		return new PathPosix(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
	}
};
/**
* The base class for all PathScurry classes, providing the interface for path
* resolution and filesystem operations.
*
* Typically, you should *not* instantiate this class directly, but rather one
* of the platform-specific classes, or the exported {@link PathScurry} which
* defaults to the current platform.
*/
var PathScurryBase = class {
	/**
	* The root Path entry for the current working directory of this Scurry
	*/
	root;
	/**
	* The string path for the root of this Scurry's current working directory
	*/
	rootPath;
	/**
	* A collection of all roots encountered, referenced by rootPath
	*/
	roots;
	/**
	* The Path entry corresponding to this PathScurry's current working directory.
	*/
	cwd;
	#resolveCache;
	#resolvePosixCache;
	#children;
	/**
	* Perform path comparisons case-insensitively.
	*
	* Defaults true on Darwin and Windows systems, false elsewhere.
	*/
	nocase;
	#fs;
	/**
	* This class should not be instantiated directly.
	*
	* Use PathScurryWin32, PathScurryDarwin, PathScurryPosix, or PathScurry
	*
	* @internal
	*/
	constructor(cwd$2 = process.cwd(), pathImpl, sep$3, { nocase, childrenCacheSize = 16 * 1024, fs: fs$1 = defaultFS } = {}) {
		this.#fs = fsFromOption(fs$1);
		if (cwd$2 instanceof URL || cwd$2.startsWith("file://")) cwd$2 = fileURLToPath$1(cwd$2);
		const cwdPath = pathImpl.resolve(cwd$2);
		this.roots = Object.create(null);
		this.rootPath = this.parseRootPath(cwdPath);
		this.#resolveCache = new ResolveCache();
		this.#resolvePosixCache = new ResolveCache();
		this.#children = new ChildrenCache(childrenCacheSize);
		const split = cwdPath.substring(this.rootPath.length).split(sep$3);
		if (split.length === 1 && !split[0]) split.pop();
		/* c8 ignore start */
		if (nocase === void 0) throw new TypeError("must provide nocase setting to PathScurryBase ctor");
		/* c8 ignore stop */
		this.nocase = nocase;
		this.root = this.newRoot(this.#fs);
		this.roots[this.rootPath] = this.root;
		let prev = this.root;
		let len = split.length - 1;
		const joinSep = pathImpl.sep;
		let abs = this.rootPath;
		let sawFirst = false;
		for (const part of split) {
			const l = len--;
			prev = prev.child(part, {
				relative: new Array(l).fill("..").join(joinSep),
				relativePosix: new Array(l).fill("..").join("/"),
				fullpath: abs += (sawFirst ? "" : joinSep) + part
			});
			sawFirst = true;
		}
		this.cwd = prev;
	}
	/**
	* Get the depth of a provided path, string, or the cwd
	*/
	depth(path$2 = this.cwd) {
		if (typeof path$2 === "string") path$2 = this.cwd.resolve(path$2);
		return path$2.depth();
	}
	/**
	* Return the cache of child entries.  Exposed so subclasses can create
	* child Path objects in a platform-specific way.
	*
	* @internal
	*/
	childrenCache() {
		return this.#children;
	}
	/**
	* Resolve one or more path strings to a resolved string
	*
	* Same interface as require('path').resolve.
	*
	* Much faster than path.resolve() when called multiple times for the same
	* path, because the resolved Path objects are cached.  Much slower
	* otherwise.
	*/
	resolve(...paths) {
		let r = "";
		for (let i = paths.length - 1; i >= 0; i--) {
			const p = paths[i];
			if (!p || p === ".") continue;
			r = r ? `${p}/${r}` : p;
			if (this.isAbsolute(p)) break;
		}
		const cached = this.#resolveCache.get(r);
		if (cached !== void 0) return cached;
		const result = this.cwd.resolve(r).fullpath();
		this.#resolveCache.set(r, result);
		return result;
	}
	/**
	* Resolve one or more path strings to a resolved string, returning
	* the posix path.  Identical to .resolve() on posix systems, but on
	* windows will return a forward-slash separated UNC path.
	*
	* Same interface as require('path').resolve.
	*
	* Much faster than path.resolve() when called multiple times for the same
	* path, because the resolved Path objects are cached.  Much slower
	* otherwise.
	*/
	resolvePosix(...paths) {
		let r = "";
		for (let i = paths.length - 1; i >= 0; i--) {
			const p = paths[i];
			if (!p || p === ".") continue;
			r = r ? `${p}/${r}` : p;
			if (this.isAbsolute(p)) break;
		}
		const cached = this.#resolvePosixCache.get(r);
		if (cached !== void 0) return cached;
		const result = this.cwd.resolve(r).fullpathPosix();
		this.#resolvePosixCache.set(r, result);
		return result;
	}
	/**
	* find the relative path from the cwd to the supplied path string or entry
	*/
	relative(entry = this.cwd) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		return entry.relative();
	}
	/**
	* find the relative path from the cwd to the supplied path string or
	* entry, using / as the path delimiter, even on Windows.
	*/
	relativePosix(entry = this.cwd) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		return entry.relativePosix();
	}
	/**
	* Return the basename for the provided string or Path object
	*/
	basename(entry = this.cwd) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		return entry.name;
	}
	/**
	* Return the dirname for the provided string or Path object
	*/
	dirname(entry = this.cwd) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		return (entry.parent || entry).fullpath();
	}
	async readdir(entry = this.cwd, opts = { withFileTypes: true }) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes } = opts;
		if (!entry.canReaddir()) return [];
		else {
			const p = await entry.readdir();
			return withFileTypes ? p : p.map((e) => e.name);
		}
	}
	readdirSync(entry = this.cwd, opts = { withFileTypes: true }) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes = true } = opts;
		if (!entry.canReaddir()) return [];
		else if (withFileTypes) return entry.readdirSync();
		else return entry.readdirSync().map((e) => e.name);
	}
	/**
	* Call lstat() on the string or Path object, and update all known
	* information that can be determined.
	*
	* Note that unlike `fs.lstat()`, the returned value does not contain some
	* information, such as `mode`, `dev`, `nlink`, and `ino`.  If that
	* information is required, you will need to call `fs.lstat` yourself.
	*
	* If the Path refers to a nonexistent file, or if the lstat call fails for
	* any reason, `undefined` is returned.  Otherwise the updated Path object is
	* returned.
	*
	* Results are cached, and thus may be out of date if the filesystem is
	* mutated.
	*/
	async lstat(entry = this.cwd) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		return entry.lstat();
	}
	/**
	* synchronous {@link PathScurryBase.lstat}
	*/
	lstatSync(entry = this.cwd) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		return entry.lstatSync();
	}
	async readlink(entry = this.cwd, { withFileTypes } = { withFileTypes: false }) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			withFileTypes = entry.withFileTypes;
			entry = this.cwd;
		}
		const e = await entry.readlink();
		return withFileTypes ? e : e?.fullpath();
	}
	readlinkSync(entry = this.cwd, { withFileTypes } = { withFileTypes: false }) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			withFileTypes = entry.withFileTypes;
			entry = this.cwd;
		}
		const e = entry.readlinkSync();
		return withFileTypes ? e : e?.fullpath();
	}
	async realpath(entry = this.cwd, { withFileTypes } = { withFileTypes: false }) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			withFileTypes = entry.withFileTypes;
			entry = this.cwd;
		}
		const e = await entry.realpath();
		return withFileTypes ? e : e?.fullpath();
	}
	realpathSync(entry = this.cwd, { withFileTypes } = { withFileTypes: false }) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			withFileTypes = entry.withFileTypes;
			entry = this.cwd;
		}
		const e = entry.realpathSync();
		return withFileTypes ? e : e?.fullpath();
	}
	async walk(entry = this.cwd, opts = {}) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes = true, follow = false, filter: filter$1, walkFilter } = opts;
		const results = [];
		if (!filter$1 || filter$1(entry)) results.push(withFileTypes ? entry : entry.fullpath());
		const dirs = /* @__PURE__ */ new Set();
		const walk = (dir, cb) => {
			dirs.add(dir);
			dir.readdirCB((er, entries) => {
				/* c8 ignore start */
				if (er) return cb(er);
				/* c8 ignore stop */
				let len = entries.length;
				if (!len) return cb();
				const next = () => {
					if (--len === 0) cb();
				};
				for (const e of entries) {
					if (!filter$1 || filter$1(e)) results.push(withFileTypes ? e : e.fullpath());
					if (follow && e.isSymbolicLink()) e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r).then((r) => r?.shouldWalk(dirs, walkFilter) ? walk(r, next) : next());
					else if (e.shouldWalk(dirs, walkFilter)) walk(e, next);
					else next();
				}
			}, true);
		};
		const start = entry;
		return new Promise((res, rej) => {
			walk(start, (er) => {
				/* c8 ignore start */
				if (er) return rej(er);
				/* c8 ignore stop */
				res(results);
			});
		});
	}
	walkSync(entry = this.cwd, opts = {}) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes = true, follow = false, filter: filter$1, walkFilter } = opts;
		const results = [];
		if (!filter$1 || filter$1(entry)) results.push(withFileTypes ? entry : entry.fullpath());
		const dirs = new Set([entry]);
		for (const dir of dirs) {
			const entries = dir.readdirSync();
			for (const e of entries) {
				if (!filter$1 || filter$1(e)) results.push(withFileTypes ? e : e.fullpath());
				let r = e;
				if (e.isSymbolicLink()) {
					if (!(follow && (r = e.realpathSync()))) continue;
					if (r.isUnknown()) r.lstatSync();
				}
				if (r.shouldWalk(dirs, walkFilter)) dirs.add(r);
			}
		}
		return results;
	}
	/**
	* Support for `for await`
	*
	* Alias for {@link PathScurryBase.iterate}
	*
	* Note: As of Node 19, this is very slow, compared to other methods of
	* walking.  Consider using {@link PathScurryBase.stream} if memory overhead
	* and backpressure are concerns, or {@link PathScurryBase.walk} if not.
	*/
	[Symbol.asyncIterator]() {
		return this.iterate();
	}
	iterate(entry = this.cwd, options = {}) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			options = entry;
			entry = this.cwd;
		}
		return this.stream(entry, options)[Symbol.asyncIterator]();
	}
	/**
	* Iterating over a PathScurry performs a synchronous walk.
	*
	* Alias for {@link PathScurryBase.iterateSync}
	*/
	[Symbol.iterator]() {
		return this.iterateSync();
	}
	*iterateSync(entry = this.cwd, opts = {}) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes = true, follow = false, filter: filter$1, walkFilter } = opts;
		if (!filter$1 || filter$1(entry)) yield withFileTypes ? entry : entry.fullpath();
		const dirs = new Set([entry]);
		for (const dir of dirs) {
			const entries = dir.readdirSync();
			for (const e of entries) {
				if (!filter$1 || filter$1(e)) yield withFileTypes ? e : e.fullpath();
				let r = e;
				if (e.isSymbolicLink()) {
					if (!(follow && (r = e.realpathSync()))) continue;
					if (r.isUnknown()) r.lstatSync();
				}
				if (r.shouldWalk(dirs, walkFilter)) dirs.add(r);
			}
		}
	}
	stream(entry = this.cwd, opts = {}) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes = true, follow = false, filter: filter$1, walkFilter } = opts;
		const results = new Minipass({ objectMode: true });
		if (!filter$1 || filter$1(entry)) results.write(withFileTypes ? entry : entry.fullpath());
		const dirs = /* @__PURE__ */ new Set();
		const queue = [entry];
		let processing = 0;
		const process$1 = () => {
			let paused = false;
			while (!paused) {
				const dir = queue.shift();
				if (!dir) {
					if (processing === 0) results.end();
					return;
				}
				processing++;
				dirs.add(dir);
				const onReaddir = (er, entries, didRealpaths = false) => {
					/* c8 ignore start */
					if (er) return results.emit("error", er);
					/* c8 ignore stop */
					if (follow && !didRealpaths) {
						const promises = [];
						for (const e of entries) if (e.isSymbolicLink()) promises.push(e.realpath().then((r) => r?.isUnknown() ? r.lstat() : r));
						if (promises.length) {
							Promise.all(promises).then(() => onReaddir(null, entries, true));
							return;
						}
					}
					for (const e of entries) if (e && (!filter$1 || filter$1(e))) {
						if (!results.write(withFileTypes ? e : e.fullpath())) paused = true;
					}
					processing--;
					for (const e of entries) {
						const r = e.realpathCached() || e;
						if (r.shouldWalk(dirs, walkFilter)) queue.push(r);
					}
					if (paused && !results.flowing) results.once("drain", process$1);
					else if (!sync$1) process$1();
				};
				let sync$1 = true;
				dir.readdirCB(onReaddir, true);
				sync$1 = false;
			}
		};
		process$1();
		return results;
	}
	streamSync(entry = this.cwd, opts = {}) {
		if (typeof entry === "string") entry = this.cwd.resolve(entry);
		else if (!(entry instanceof PathBase)) {
			opts = entry;
			entry = this.cwd;
		}
		const { withFileTypes = true, follow = false, filter: filter$1, walkFilter } = opts;
		const results = new Minipass({ objectMode: true });
		const dirs = /* @__PURE__ */ new Set();
		if (!filter$1 || filter$1(entry)) results.write(withFileTypes ? entry : entry.fullpath());
		const queue = [entry];
		let processing = 0;
		const process$1 = () => {
			let paused = false;
			while (!paused) {
				const dir = queue.shift();
				if (!dir) {
					if (processing === 0) results.end();
					return;
				}
				processing++;
				dirs.add(dir);
				const entries = dir.readdirSync();
				for (const e of entries) if (!filter$1 || filter$1(e)) {
					if (!results.write(withFileTypes ? e : e.fullpath())) paused = true;
				}
				processing--;
				for (const e of entries) {
					let r = e;
					if (e.isSymbolicLink()) {
						if (!(follow && (r = e.realpathSync()))) continue;
						if (r.isUnknown()) r.lstatSync();
					}
					if (r.shouldWalk(dirs, walkFilter)) queue.push(r);
				}
			}
			if (paused && !results.flowing) results.once("drain", process$1);
		};
		process$1();
		return results;
	}
	chdir(path$2 = this.cwd) {
		const oldCwd = this.cwd;
		this.cwd = typeof path$2 === "string" ? this.cwd.resolve(path$2) : path$2;
		this.cwd[setAsCwd](oldCwd);
	}
};
/**
* Windows implementation of {@link PathScurryBase}
*
* Defaults to case insensitve, uses `'\\'` to generate path strings.  Uses
* {@link PathWin32} for Path objects.
*/
var PathScurryWin32 = class extends PathScurryBase {
	/**
	* separator for generating path strings
	*/
	sep = "\\";
	constructor(cwd$2 = process.cwd(), opts = {}) {
		const { nocase = true } = opts;
		super(cwd$2, win32, "\\", {
			...opts,
			nocase
		});
		this.nocase = nocase;
		for (let p = this.cwd; p; p = p.parent) p.nocase = this.nocase;
	}
	/**
	* @internal
	*/
	parseRootPath(dir) {
		return win32.parse(dir).root.toUpperCase();
	}
	/**
	* @internal
	*/
	newRoot(fs$1) {
		return new PathWin32(this.rootPath, IFDIR, void 0, this.roots, this.nocase, this.childrenCache(), { fs: fs$1 });
	}
	/**
	* Return true if the provided path string is an absolute path
	*/
	isAbsolute(p) {
		return p.startsWith("/") || p.startsWith("\\") || /^[a-z]:(\/|\\)/i.test(p);
	}
};
/**
* {@link PathScurryBase} implementation for all posix systems other than Darwin.
*
* Defaults to case-sensitive matching, uses `'/'` to generate path strings.
*
* Uses {@link PathPosix} for Path objects.
*/
var PathScurryPosix = class extends PathScurryBase {
	/**
	* separator for generating path strings
	*/
	sep = "/";
	constructor(cwd$2 = process.cwd(), opts = {}) {
		const { nocase = false } = opts;
		super(cwd$2, posix, "/", {
			...opts,
			nocase
		});
		this.nocase = nocase;
	}
	/**
	* @internal
	*/
	parseRootPath(_dir) {
		return "/";
	}
	/**
	* @internal
	*/
	newRoot(fs$1) {
		return new PathPosix(this.rootPath, IFDIR, void 0, this.roots, this.nocase, this.childrenCache(), { fs: fs$1 });
	}
	/**
	* Return true if the provided path string is an absolute path
	*/
	isAbsolute(p) {
		return p.startsWith("/");
	}
};
/**
* {@link PathScurryBase} implementation for Darwin (macOS) systems.
*
* Defaults to case-insensitive matching, uses `'/'` for generating path
* strings.
*
* Uses {@link PathPosix} for Path objects.
*/
var PathScurryDarwin = class extends PathScurryPosix {
	constructor(cwd$2 = process.cwd(), opts = {}) {
		const { nocase = true } = opts;
		super(cwd$2, {
			...opts,
			nocase
		});
	}
};
/**
* Default {@link PathBase} implementation for the current platform.
*
* {@link PathWin32} on Windows systems, {@link PathPosix} on all others.
*/
const Path = process.platform === "win32" ? PathWin32 : PathPosix;
/**
* Default {@link PathScurryBase} implementation for the current platform.
*
* {@link PathScurryWin32} on Windows systems, {@link PathScurryDarwin} on
* Darwin (macOS) systems, {@link PathScurryPosix} on all others.
*/
const PathScurry = process.platform === "win32" ? PathScurryWin32 : process.platform === "darwin" ? PathScurryDarwin : PathScurryPosix;

//#endregion
//#region node_modules/glob/dist/esm/pattern.js
const isPatternList = (pl) => pl.length >= 1;
const isGlobList = (gl) => gl.length >= 1;
/**
* An immutable-ish view on an array of glob parts and their parsed
* results
*/
var Pattern = class Pattern {
	#patternList;
	#globList;
	#index;
	length;
	#platform;
	#rest;
	#globString;
	#isDrive;
	#isUNC;
	#isAbsolute;
	#followGlobstar = true;
	constructor(patternList, globList, index, platform) {
		if (!isPatternList(patternList)) throw new TypeError("empty pattern list");
		if (!isGlobList(globList)) throw new TypeError("empty glob list");
		if (globList.length !== patternList.length) throw new TypeError("mismatched pattern list and glob list lengths");
		this.length = patternList.length;
		if (index < 0 || index >= this.length) throw new TypeError("index out of range");
		this.#patternList = patternList;
		this.#globList = globList;
		this.#index = index;
		this.#platform = platform;
		if (this.#index === 0) {
			if (this.isUNC()) {
				const [p0, p1, p2, p3, ...prest] = this.#patternList;
				const [g0, g1, g2, g3, ...grest] = this.#globList;
				if (prest[0] === "") {
					prest.shift();
					grest.shift();
				}
				const p = [
					p0,
					p1,
					p2,
					p3,
					""
				].join("/");
				const g = [
					g0,
					g1,
					g2,
					g3,
					""
				].join("/");
				this.#patternList = [p, ...prest];
				this.#globList = [g, ...grest];
				this.length = this.#patternList.length;
			} else if (this.isDrive() || this.isAbsolute()) {
				const [p1, ...prest] = this.#patternList;
				const [g1, ...grest] = this.#globList;
				if (prest[0] === "") {
					prest.shift();
					grest.shift();
				}
				const p = p1 + "/";
				const g = g1 + "/";
				this.#patternList = [p, ...prest];
				this.#globList = [g, ...grest];
				this.length = this.#patternList.length;
			}
		}
	}
	/**
	* The first entry in the parsed list of patterns
	*/
	pattern() {
		return this.#patternList[this.#index];
	}
	/**
	* true of if pattern() returns a string
	*/
	isString() {
		return typeof this.#patternList[this.#index] === "string";
	}
	/**
	* true of if pattern() returns GLOBSTAR
	*/
	isGlobstar() {
		return this.#patternList[this.#index] === GLOBSTAR;
	}
	/**
	* true if pattern() returns a regexp
	*/
	isRegExp() {
		return this.#patternList[this.#index] instanceof RegExp;
	}
	/**
	* The /-joined set of glob parts that make up this pattern
	*/
	globString() {
		return this.#globString = this.#globString || (this.#index === 0 ? this.isAbsolute() ? this.#globList[0] + this.#globList.slice(1).join("/") : this.#globList.join("/") : this.#globList.slice(this.#index).join("/"));
	}
	/**
	* true if there are more pattern parts after this one
	*/
	hasMore() {
		return this.length > this.#index + 1;
	}
	/**
	* The rest of the pattern after this part, or null if this is the end
	*/
	rest() {
		if (this.#rest !== void 0) return this.#rest;
		if (!this.hasMore()) return this.#rest = null;
		this.#rest = new Pattern(this.#patternList, this.#globList, this.#index + 1, this.#platform);
		this.#rest.#isAbsolute = this.#isAbsolute;
		this.#rest.#isUNC = this.#isUNC;
		this.#rest.#isDrive = this.#isDrive;
		return this.#rest;
	}
	/**
	* true if the pattern represents a //unc/path/ on windows
	*/
	isUNC() {
		const pl = this.#patternList;
		return this.#isUNC !== void 0 ? this.#isUNC : this.#isUNC = this.#platform === "win32" && this.#index === 0 && pl[0] === "" && pl[1] === "" && typeof pl[2] === "string" && !!pl[2] && typeof pl[3] === "string" && !!pl[3];
	}
	/**
	* True if the pattern starts with a drive letter on Windows
	*/
	isDrive() {
		const pl = this.#patternList;
		return this.#isDrive !== void 0 ? this.#isDrive : this.#isDrive = this.#platform === "win32" && this.#index === 0 && this.length > 1 && typeof pl[0] === "string" && /^[a-z]:$/i.test(pl[0]);
	}
	/**
	* True if the pattern is rooted on an absolute path
	*/
	isAbsolute() {
		const pl = this.#patternList;
		return this.#isAbsolute !== void 0 ? this.#isAbsolute : this.#isAbsolute = pl[0] === "" && pl.length > 1 || this.isDrive() || this.isUNC();
	}
	/**
	* consume the root of the pattern, and return it
	*/
	root() {
		const p = this.#patternList[0];
		return typeof p === "string" && this.isAbsolute() && this.#index === 0 ? p : "";
	}
	/**
	* Check to see if the current globstar pattern is allowed to follow
	* a symbolic link.
	*/
	checkFollowGlobstar() {
		return !(this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar);
	}
	/**
	* Mark that the current globstar pattern is following a symbolic link
	*/
	markFollowGlobstar() {
		if (this.#index === 0 || !this.isGlobstar() || !this.#followGlobstar) return false;
		this.#followGlobstar = false;
		return true;
	}
};

//#endregion
//#region node_modules/glob/dist/esm/ignore.js
const defaultPlatform$1 = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";
/**
* Class used to process ignored patterns
*/
var Ignore = class {
	relative;
	relativeChildren;
	absolute;
	absoluteChildren;
	platform;
	mmopts;
	constructor(ignored, { nobrace, nocase, noext, noglobstar, platform = defaultPlatform$1 }) {
		this.relative = [];
		this.absolute = [];
		this.relativeChildren = [];
		this.absoluteChildren = [];
		this.platform = platform;
		this.mmopts = {
			dot: true,
			nobrace,
			nocase,
			noext,
			noglobstar,
			optimizationLevel: 2,
			platform,
			nocomment: true,
			nonegate: true
		};
		for (const ign of ignored) this.add(ign);
	}
	add(ign) {
		const mm = new Minimatch(ign, this.mmopts);
		for (let i = 0; i < mm.set.length; i++) {
			const parsed = mm.set[i];
			const globParts = mm.globParts[i];
			/* c8 ignore start */
			if (!parsed || !globParts) throw new Error("invalid pattern object");
			while (parsed[0] === "." && globParts[0] === ".") {
				parsed.shift();
				globParts.shift();
			}
			/* c8 ignore stop */
			const p = new Pattern(parsed, globParts, 0, this.platform);
			const m = new Minimatch(p.globString(), this.mmopts);
			const children = globParts[globParts.length - 1] === "**";
			const absolute = p.isAbsolute();
			if (absolute) this.absolute.push(m);
			else this.relative.push(m);
			if (children) if (absolute) this.absoluteChildren.push(m);
			else this.relativeChildren.push(m);
		}
	}
	ignored(p) {
		const fullpath = p.fullpath();
		const fullpaths = `${fullpath}/`;
		const relative$2 = p.relative() || ".";
		const relatives = `${relative$2}/`;
		for (const m of this.relative) if (m.match(relative$2) || m.match(relatives)) return true;
		for (const m of this.absolute) if (m.match(fullpath) || m.match(fullpaths)) return true;
		return false;
	}
	childrenIgnored(p) {
		const fullpath = p.fullpath() + "/";
		const relative$2 = (p.relative() || ".") + "/";
		for (const m of this.relativeChildren) if (m.match(relative$2)) return true;
		for (const m of this.absoluteChildren) if (m.match(fullpath)) return true;
		return false;
	}
};

//#endregion
//#region node_modules/glob/dist/esm/processor.js
/**
* A cache of which patterns have been processed for a given Path
*/
var HasWalkedCache = class HasWalkedCache {
	store;
	constructor(store = /* @__PURE__ */ new Map()) {
		this.store = store;
	}
	copy() {
		return new HasWalkedCache(new Map(this.store));
	}
	hasWalked(target, pattern) {
		return this.store.get(target.fullpath())?.has(pattern.globString());
	}
	storeWalked(target, pattern) {
		const fullpath = target.fullpath();
		const cached = this.store.get(fullpath);
		if (cached) cached.add(pattern.globString());
		else this.store.set(fullpath, new Set([pattern.globString()]));
	}
};
/**
* A record of which paths have been matched in a given walk step,
* and whether they only are considered a match if they are a directory,
* and whether their absolute or relative path should be returned.
*/
var MatchRecord = class {
	store = /* @__PURE__ */ new Map();
	add(target, absolute, ifDir) {
		const n = (absolute ? 2 : 0) | (ifDir ? 1 : 0);
		const current = this.store.get(target);
		this.store.set(target, current === void 0 ? n : n & current);
	}
	entries() {
		return [...this.store.entries()].map(([path$2, n]) => [
			path$2,
			!!(n & 2),
			!!(n & 1)
		]);
	}
};
/**
* A collection of patterns that must be processed in a subsequent step
* for a given path.
*/
var SubWalks = class {
	store = /* @__PURE__ */ new Map();
	add(target, pattern) {
		if (!target.canReaddir()) return;
		const subs = this.store.get(target);
		if (subs) {
			if (!subs.find((p) => p.globString() === pattern.globString())) subs.push(pattern);
		} else this.store.set(target, [pattern]);
	}
	get(target) {
		const subs = this.store.get(target);
		/* c8 ignore start */
		if (!subs) throw new Error("attempting to walk unknown path");
		/* c8 ignore stop */
		return subs;
	}
	entries() {
		return this.keys().map((k) => [k, this.store.get(k)]);
	}
	keys() {
		return [...this.store.keys()].filter((t) => t.canReaddir());
	}
};
/**
* The class that processes patterns for a given path.
*
* Handles child entry filtering, and determining whether a path's
* directory contents must be read.
*/
var Processor = class Processor {
	hasWalkedCache;
	matches = new MatchRecord();
	subwalks = new SubWalks();
	patterns;
	follow;
	dot;
	opts;
	constructor(opts, hasWalkedCache) {
		this.opts = opts;
		this.follow = !!opts.follow;
		this.dot = !!opts.dot;
		this.hasWalkedCache = hasWalkedCache ? hasWalkedCache.copy() : new HasWalkedCache();
	}
	processPatterns(target, patterns) {
		this.patterns = patterns;
		const processingSet = patterns.map((p) => [target, p]);
		for (let [t, pattern] of processingSet) {
			this.hasWalkedCache.storeWalked(t, pattern);
			const root = pattern.root();
			const absolute = pattern.isAbsolute() && this.opts.absolute !== false;
			if (root) {
				t = t.resolve(root === "/" && this.opts.root !== void 0 ? this.opts.root : root);
				const rest$1 = pattern.rest();
				if (!rest$1) {
					this.matches.add(t, true, false);
					continue;
				} else pattern = rest$1;
			}
			if (t.isENOENT()) continue;
			let p;
			let rest;
			let changed = false;
			while (typeof (p = pattern.pattern()) === "string" && (rest = pattern.rest())) {
				t = t.resolve(p);
				pattern = rest;
				changed = true;
			}
			p = pattern.pattern();
			rest = pattern.rest();
			if (changed) {
				if (this.hasWalkedCache.hasWalked(t, pattern)) continue;
				this.hasWalkedCache.storeWalked(t, pattern);
			}
			if (typeof p === "string") {
				const ifDir = p === ".." || p === "" || p === ".";
				this.matches.add(t.resolve(p), absolute, ifDir);
				continue;
			} else if (p === GLOBSTAR) {
				if (!t.isSymbolicLink() || this.follow || pattern.checkFollowGlobstar()) this.subwalks.add(t, pattern);
				const rp = rest?.pattern();
				const rrest = rest?.rest();
				if (!rest || (rp === "" || rp === ".") && !rrest) this.matches.add(t, absolute, rp === "" || rp === ".");
				else if (rp === "..") {
					/* c8 ignore start */
					const tp = t.parent || t;
					/* c8 ignore stop */
					if (!rrest) this.matches.add(tp, absolute, true);
					else if (!this.hasWalkedCache.hasWalked(tp, rrest)) this.subwalks.add(tp, rrest);
				}
			} else if (p instanceof RegExp) this.subwalks.add(t, pattern);
		}
		return this;
	}
	subwalkTargets() {
		return this.subwalks.keys();
	}
	child() {
		return new Processor(this.opts, this.hasWalkedCache);
	}
	filterEntries(parent, entries) {
		const patterns = this.subwalks.get(parent);
		const results = this.child();
		for (const e of entries) for (const pattern of patterns) {
			const absolute = pattern.isAbsolute();
			const p = pattern.pattern();
			const rest = pattern.rest();
			if (p === GLOBSTAR) results.testGlobstar(e, pattern, rest, absolute);
			else if (p instanceof RegExp) results.testRegExp(e, p, rest, absolute);
			else results.testString(e, p, rest, absolute);
		}
		return results;
	}
	testGlobstar(e, pattern, rest, absolute) {
		if (this.dot || !e.name.startsWith(".")) {
			if (!pattern.hasMore()) this.matches.add(e, absolute, false);
			if (e.canReaddir()) {
				if (this.follow || !e.isSymbolicLink()) this.subwalks.add(e, pattern);
				else if (e.isSymbolicLink()) {
					if (rest && pattern.checkFollowGlobstar()) this.subwalks.add(e, rest);
					else if (pattern.markFollowGlobstar()) this.subwalks.add(e, pattern);
				}
			}
		}
		if (rest) {
			const rp = rest.pattern();
			if (typeof rp === "string" && rp !== ".." && rp !== "" && rp !== ".") this.testString(e, rp, rest.rest(), absolute);
			else if (rp === "..") {
				/* c8 ignore start */
				const ep = e.parent || e;
				/* c8 ignore stop */
				this.subwalks.add(ep, rest);
			} else if (rp instanceof RegExp) this.testRegExp(e, rp, rest.rest(), absolute);
		}
	}
	testRegExp(e, p, rest, absolute) {
		if (!p.test(e.name)) return;
		if (!rest) this.matches.add(e, absolute, false);
		else this.subwalks.add(e, rest);
	}
	testString(e, p, rest, absolute) {
		if (!e.isNamed(p)) return;
		if (!rest) this.matches.add(e, absolute, false);
		else this.subwalks.add(e, rest);
	}
};

//#endregion
//#region node_modules/glob/dist/esm/walker.js
const makeIgnore = (ignore, opts) => typeof ignore === "string" ? new Ignore([ignore], opts) : Array.isArray(ignore) ? new Ignore(ignore, opts) : ignore;
/**
* basic walking utilities that all the glob walker types use
*/
var GlobUtil = class {
	path;
	patterns;
	opts;
	seen = /* @__PURE__ */ new Set();
	paused = false;
	aborted = false;
	#onResume = [];
	#ignore;
	#sep;
	signal;
	maxDepth;
	includeChildMatches;
	constructor(patterns, path$2, opts) {
		this.patterns = patterns;
		this.path = path$2;
		this.opts = opts;
		this.#sep = !opts.posix && opts.platform === "win32" ? "\\" : "/";
		this.includeChildMatches = opts.includeChildMatches !== false;
		if (opts.ignore || !this.includeChildMatches) {
			this.#ignore = makeIgnore(opts.ignore ?? [], opts);
			if (!this.includeChildMatches && typeof this.#ignore.add !== "function") throw new Error("cannot ignore child matches, ignore lacks add() method.");
		}
		/* c8 ignore start */
		this.maxDepth = opts.maxDepth || Infinity;
		/* c8 ignore stop */
		if (opts.signal) {
			this.signal = opts.signal;
			this.signal.addEventListener("abort", () => {
				this.#onResume.length = 0;
			});
		}
	}
	#ignored(path$2) {
		return this.seen.has(path$2) || !!this.#ignore?.ignored?.(path$2);
	}
	#childrenIgnored(path$2) {
		return !!this.#ignore?.childrenIgnored?.(path$2);
	}
	pause() {
		this.paused = true;
	}
	resume() {
		/* c8 ignore start */
		if (this.signal?.aborted) return;
		/* c8 ignore stop */
		this.paused = false;
		let fn = void 0;
		while (!this.paused && (fn = this.#onResume.shift())) fn();
	}
	onResume(fn) {
		if (this.signal?.aborted) return;
		/* c8 ignore start */
		if (!this.paused) fn();
		else
 /* c8 ignore stop */
		this.#onResume.push(fn);
	}
	async matchCheck(e, ifDir) {
		if (ifDir && this.opts.nodir) return void 0;
		let rpc;
		if (this.opts.realpath) {
			rpc = e.realpathCached() || await e.realpath();
			if (!rpc) return void 0;
			e = rpc;
		}
		const s = e.isUnknown() || this.opts.stat ? await e.lstat() : e;
		if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
			const target = await s.realpath();
			/* c8 ignore start */
			if (target && (target.isUnknown() || this.opts.stat)) await target.lstat();
		}
		return this.matchCheckTest(s, ifDir);
	}
	matchCheckTest(e, ifDir) {
		return e && (this.maxDepth === Infinity || e.depth() <= this.maxDepth) && (!ifDir || e.canReaddir()) && (!this.opts.nodir || !e.isDirectory()) && (!this.opts.nodir || !this.opts.follow || !e.isSymbolicLink() || !e.realpathCached()?.isDirectory()) && !this.#ignored(e) ? e : void 0;
	}
	matchCheckSync(e, ifDir) {
		if (ifDir && this.opts.nodir) return void 0;
		let rpc;
		if (this.opts.realpath) {
			rpc = e.realpathCached() || e.realpathSync();
			if (!rpc) return void 0;
			e = rpc;
		}
		const s = e.isUnknown() || this.opts.stat ? e.lstatSync() : e;
		if (this.opts.follow && this.opts.nodir && s?.isSymbolicLink()) {
			const target = s.realpathSync();
			if (target && (target?.isUnknown() || this.opts.stat)) target.lstatSync();
		}
		return this.matchCheckTest(s, ifDir);
	}
	matchFinish(e, absolute) {
		if (this.#ignored(e)) return;
		if (!this.includeChildMatches && this.#ignore?.add) {
			const ign = `${e.relativePosix()}/**`;
			this.#ignore.add(ign);
		}
		const abs = this.opts.absolute === void 0 ? absolute : this.opts.absolute;
		this.seen.add(e);
		const mark = this.opts.mark && e.isDirectory() ? this.#sep : "";
		if (this.opts.withFileTypes) this.matchEmit(e);
		else if (abs) {
			const abs$1 = this.opts.posix ? e.fullpathPosix() : e.fullpath();
			this.matchEmit(abs$1 + mark);
		} else {
			const rel = this.opts.posix ? e.relativePosix() : e.relative();
			const pre = this.opts.dotRelative && !rel.startsWith(".." + this.#sep) ? "." + this.#sep : "";
			this.matchEmit(!rel ? "." + mark : pre + rel + mark);
		}
	}
	async match(e, absolute, ifDir) {
		const p = await this.matchCheck(e, ifDir);
		if (p) this.matchFinish(p, absolute);
	}
	matchSync(e, absolute, ifDir) {
		const p = this.matchCheckSync(e, ifDir);
		if (p) this.matchFinish(p, absolute);
	}
	walkCB(target, patterns, cb) {
		/* c8 ignore start */
		if (this.signal?.aborted) cb();
		/* c8 ignore stop */
		this.walkCB2(target, patterns, new Processor(this.opts), cb);
	}
	walkCB2(target, patterns, processor, cb) {
		if (this.#childrenIgnored(target)) return cb();
		if (this.signal?.aborted) cb();
		if (this.paused) {
			this.onResume(() => this.walkCB2(target, patterns, processor, cb));
			return;
		}
		processor.processPatterns(target, patterns);
		let tasks = 1;
		const next = () => {
			if (--tasks === 0) cb();
		};
		for (const [m, absolute, ifDir] of processor.matches.entries()) {
			if (this.#ignored(m)) continue;
			tasks++;
			this.match(m, absolute, ifDir).then(() => next());
		}
		for (const t of processor.subwalkTargets()) {
			if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) continue;
			tasks++;
			const childrenCached = t.readdirCached();
			if (t.calledReaddir()) this.walkCB3(t, childrenCached, processor, next);
			else t.readdirCB((_, entries) => this.walkCB3(t, entries, processor, next), true);
		}
		next();
	}
	walkCB3(target, entries, processor, cb) {
		processor = processor.filterEntries(target, entries);
		let tasks = 1;
		const next = () => {
			if (--tasks === 0) cb();
		};
		for (const [m, absolute, ifDir] of processor.matches.entries()) {
			if (this.#ignored(m)) continue;
			tasks++;
			this.match(m, absolute, ifDir).then(() => next());
		}
		for (const [target$1, patterns] of processor.subwalks.entries()) {
			tasks++;
			this.walkCB2(target$1, patterns, processor.child(), next);
		}
		next();
	}
	walkCBSync(target, patterns, cb) {
		/* c8 ignore start */
		if (this.signal?.aborted) cb();
		/* c8 ignore stop */
		this.walkCB2Sync(target, patterns, new Processor(this.opts), cb);
	}
	walkCB2Sync(target, patterns, processor, cb) {
		if (this.#childrenIgnored(target)) return cb();
		if (this.signal?.aborted) cb();
		if (this.paused) {
			this.onResume(() => this.walkCB2Sync(target, patterns, processor, cb));
			return;
		}
		processor.processPatterns(target, patterns);
		let tasks = 1;
		const next = () => {
			if (--tasks === 0) cb();
		};
		for (const [m, absolute, ifDir] of processor.matches.entries()) {
			if (this.#ignored(m)) continue;
			this.matchSync(m, absolute, ifDir);
		}
		for (const t of processor.subwalkTargets()) {
			if (this.maxDepth !== Infinity && t.depth() >= this.maxDepth) continue;
			tasks++;
			const children = t.readdirSync();
			this.walkCB3Sync(t, children, processor, next);
		}
		next();
	}
	walkCB3Sync(target, entries, processor, cb) {
		processor = processor.filterEntries(target, entries);
		let tasks = 1;
		const next = () => {
			if (--tasks === 0) cb();
		};
		for (const [m, absolute, ifDir] of processor.matches.entries()) {
			if (this.#ignored(m)) continue;
			this.matchSync(m, absolute, ifDir);
		}
		for (const [target$1, patterns] of processor.subwalks.entries()) {
			tasks++;
			this.walkCB2Sync(target$1, patterns, processor.child(), next);
		}
		next();
	}
};
var GlobWalker = class extends GlobUtil {
	matches = /* @__PURE__ */ new Set();
	constructor(patterns, path$2, opts) {
		super(patterns, path$2, opts);
	}
	matchEmit(e) {
		this.matches.add(e);
	}
	async walk() {
		if (this.signal?.aborted) throw this.signal.reason;
		if (this.path.isUnknown()) await this.path.lstat();
		await new Promise((res, rej) => {
			this.walkCB(this.path, this.patterns, () => {
				if (this.signal?.aborted) rej(this.signal.reason);
				else res(this.matches);
			});
		});
		return this.matches;
	}
	walkSync() {
		if (this.signal?.aborted) throw this.signal.reason;
		if (this.path.isUnknown()) this.path.lstatSync();
		this.walkCBSync(this.path, this.patterns, () => {
			if (this.signal?.aborted) throw this.signal.reason;
		});
		return this.matches;
	}
};
var GlobStream = class extends GlobUtil {
	results;
	constructor(patterns, path$2, opts) {
		super(patterns, path$2, opts);
		this.results = new Minipass({
			signal: this.signal,
			objectMode: true
		});
		this.results.on("drain", () => this.resume());
		this.results.on("resume", () => this.resume());
	}
	matchEmit(e) {
		this.results.write(e);
		if (!this.results.flowing) this.pause();
	}
	stream() {
		const target = this.path;
		if (target.isUnknown()) target.lstat().then(() => {
			this.walkCB(target, this.patterns, () => this.results.end());
		});
		else this.walkCB(target, this.patterns, () => this.results.end());
		return this.results;
	}
	streamSync() {
		if (this.path.isUnknown()) this.path.lstatSync();
		this.walkCBSync(this.path, this.patterns, () => this.results.end());
		return this.results;
	}
};

//#endregion
//#region node_modules/glob/dist/esm/glob.js
const defaultPlatform = typeof process === "object" && process && typeof process.platform === "string" ? process.platform : "linux";
/**
* An object that can perform glob pattern traversals.
*/
var Glob = class {
	absolute;
	cwd;
	root;
	dot;
	dotRelative;
	follow;
	ignore;
	magicalBraces;
	mark;
	matchBase;
	maxDepth;
	nobrace;
	nocase;
	nodir;
	noext;
	noglobstar;
	pattern;
	platform;
	realpath;
	scurry;
	stat;
	signal;
	windowsPathsNoEscape;
	withFileTypes;
	includeChildMatches;
	/**
	* The options provided to the constructor.
	*/
	opts;
	/**
	* An array of parsed immutable {@link Pattern} objects.
	*/
	patterns;
	/**
	* All options are stored as properties on the `Glob` object.
	*
	* See {@link GlobOptions} for full options descriptions.
	*
	* Note that a previous `Glob` object can be passed as the
	* `GlobOptions` to another `Glob` instantiation to re-use settings
	* and caches with a new pattern.
	*
	* Traversal functions can be called multiple times to run the walk
	* again.
	*/
	constructor(pattern, opts) {
		/* c8 ignore start */
		if (!opts) throw new TypeError("glob options required");
		/* c8 ignore stop */
		this.withFileTypes = !!opts.withFileTypes;
		this.signal = opts.signal;
		this.follow = !!opts.follow;
		this.dot = !!opts.dot;
		this.dotRelative = !!opts.dotRelative;
		this.nodir = !!opts.nodir;
		this.mark = !!opts.mark;
		if (!opts.cwd) this.cwd = "";
		else if (opts.cwd instanceof URL || opts.cwd.startsWith("file://")) opts.cwd = fileURLToPath$1(opts.cwd);
		this.cwd = opts.cwd || "";
		this.root = opts.root;
		this.magicalBraces = !!opts.magicalBraces;
		this.nobrace = !!opts.nobrace;
		this.noext = !!opts.noext;
		this.realpath = !!opts.realpath;
		this.absolute = opts.absolute;
		this.includeChildMatches = opts.includeChildMatches !== false;
		this.noglobstar = !!opts.noglobstar;
		this.matchBase = !!opts.matchBase;
		this.maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : Infinity;
		this.stat = !!opts.stat;
		this.ignore = opts.ignore;
		if (this.withFileTypes && this.absolute !== void 0) throw new Error("cannot set absolute and withFileTypes:true");
		if (typeof pattern === "string") pattern = [pattern];
		this.windowsPathsNoEscape = !!opts.windowsPathsNoEscape || opts.allowWindowsEscape === false;
		if (this.windowsPathsNoEscape) pattern = pattern.map((p) => p.replace(/\\/g, "/"));
		if (this.matchBase) {
			if (opts.noglobstar) throw new TypeError("base matching requires globstar");
			pattern = pattern.map((p) => p.includes("/") ? p : `./**/${p}`);
		}
		this.pattern = pattern;
		this.platform = opts.platform || defaultPlatform;
		this.opts = {
			...opts,
			platform: this.platform
		};
		if (opts.scurry) {
			this.scurry = opts.scurry;
			if (opts.nocase !== void 0 && opts.nocase !== opts.scurry.nocase) throw new Error("nocase option contradicts provided scurry option");
		} else this.scurry = new (opts.platform === "win32" ? PathScurryWin32 : opts.platform === "darwin" ? PathScurryDarwin : opts.platform ? PathScurryPosix : PathScurry)(this.cwd, {
			nocase: opts.nocase,
			fs: opts.fs
		});
		this.nocase = this.scurry.nocase;
		const nocaseMagicOnly = this.platform === "darwin" || this.platform === "win32";
		const mmo = {
			...opts,
			dot: this.dot,
			matchBase: this.matchBase,
			nobrace: this.nobrace,
			nocase: this.nocase,
			nocaseMagicOnly,
			nocomment: true,
			noext: this.noext,
			nonegate: true,
			optimizationLevel: 2,
			platform: this.platform,
			windowsPathsNoEscape: this.windowsPathsNoEscape,
			debug: !!this.opts.debug
		};
		const [matchSet, globParts] = this.pattern.map((p) => new Minimatch(p, mmo)).reduce((set, m) => {
			set[0].push(...m.set);
			set[1].push(...m.globParts);
			return set;
		}, [[], []]);
		this.patterns = matchSet.map((set, i) => {
			const g = globParts[i];
			/* c8 ignore start */
			if (!g) throw new Error("invalid pattern object");
			/* c8 ignore stop */
			return new Pattern(set, g, 0, this.platform);
		});
	}
	async walk() {
		return [...await new GlobWalker(this.patterns, this.scurry.cwd, {
			...this.opts,
			maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
			platform: this.platform,
			nocase: this.nocase,
			includeChildMatches: this.includeChildMatches
		}).walk()];
	}
	walkSync() {
		return [...new GlobWalker(this.patterns, this.scurry.cwd, {
			...this.opts,
			maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
			platform: this.platform,
			nocase: this.nocase,
			includeChildMatches: this.includeChildMatches
		}).walkSync()];
	}
	stream() {
		return new GlobStream(this.patterns, this.scurry.cwd, {
			...this.opts,
			maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
			platform: this.platform,
			nocase: this.nocase,
			includeChildMatches: this.includeChildMatches
		}).stream();
	}
	streamSync() {
		return new GlobStream(this.patterns, this.scurry.cwd, {
			...this.opts,
			maxDepth: this.maxDepth !== Infinity ? this.maxDepth + this.scurry.cwd.depth() : Infinity,
			platform: this.platform,
			nocase: this.nocase,
			includeChildMatches: this.includeChildMatches
		}).streamSync();
	}
	/**
	* Default sync iteration function. Returns a Generator that
	* iterates over the results.
	*/
	iterateSync() {
		return this.streamSync()[Symbol.iterator]();
	}
	[Symbol.iterator]() {
		return this.iterateSync();
	}
	/**
	* Default async iteration function. Returns an AsyncGenerator that
	* iterates over the results.
	*/
	iterate() {
		return this.stream()[Symbol.asyncIterator]();
	}
	[Symbol.asyncIterator]() {
		return this.iterate();
	}
};

//#endregion
//#region node_modules/glob/dist/esm/has-magic.js
/**
* Return true if the patterns provided contain any magic glob characters,
* given the options provided.
*
* Brace expansion is not considered "magic" unless the `magicalBraces` option
* is set, as brace expansion just turns one string into an array of strings.
* So a pattern like `'x{a,b}y'` would return `false`, because `'xay'` and
* `'xby'` both do not contain any magic glob characters, and it's treated the
* same as if you had called it on `['xay', 'xby']`. When `magicalBraces:true`
* is in the options, brace expansion _is_ treated as a pattern having magic.
*/
const hasMagic = (pattern, options = {}) => {
	if (!Array.isArray(pattern)) pattern = [pattern];
	for (const p of pattern) if (new Minimatch(p, options).hasMagic()) return true;
	return false;
};

//#endregion
//#region node_modules/glob/dist/esm/index.js
function globStreamSync(pattern, options = {}) {
	return new Glob(pattern, options).streamSync();
}
function globStream(pattern, options = {}) {
	return new Glob(pattern, options).stream();
}
function globSync(pattern, options = {}) {
	return new Glob(pattern, options).walkSync();
}
async function glob_(pattern, options = {}) {
	return new Glob(pattern, options).walk();
}
function globIterateSync(pattern, options = {}) {
	return new Glob(pattern, options).iterateSync();
}
function globIterate(pattern, options = {}) {
	return new Glob(pattern, options).iterate();
}
const streamSync = globStreamSync;
const stream = Object.assign(globStream, { sync: globStreamSync });
const iterateSync = globIterateSync;
const iterate = Object.assign(globIterate, { sync: globIterateSync });
const sync = Object.assign(globSync, {
	stream: globStreamSync,
	iterate: globIterateSync
});
const glob = Object.assign(glob_, {
	glob: glob_,
	globSync,
	sync,
	globStream,
	stream,
	globStreamSync,
	streamSync,
	globIterate,
	iterate,
	globIterateSync,
	iterateSync,
	Glob,
	hasMagic,
	escape,
	unescape
});
glob.glob = glob;

//#endregion
//#region utils/glob.js
function createGlobfileManager({ monorepoDirpath }) {
	/**
	@param {{ globfileModuleSpecifier: string, importerFilepath: string }} args
	@return {string}
	*/
	function getGlobfilePath$1({ globfileModuleSpecifier, importerFilepath }) {
		if (globfileModuleSpecifier.startsWith("glob:")) return posix$1.resolve(posix$1.dirname(importerFilepath), globfileModuleSpecifier.replace("glob:", "").replaceAll("!", "%21"), "__virtual__:matches.ts");
		else if (globfileModuleSpecifier.startsWith("glob[files]:")) return posix$1.resolve(posix$1.dirname(importerFilepath), globfileModuleSpecifier.replace("glob[files]:", "").replaceAll("!", "%21"), "__virtual__:files.ts");
		else if (globfileModuleSpecifier.startsWith("glob[filepaths]:")) return posix$1.resolve(posix$1.dirname(importerFilepath), globfileModuleSpecifier.replace("glob[filepaths]:", "").replaceAll("!", "%21"), "__virtual__:filepaths.ts");
		else return posix$1.join(posix$1.dirname(importerFilepath), globfileModuleSpecifier);
	}
	/**
	@param {object} args
	@param {string} args.globfilePath
	*/
	function getGlobfileType({ globfilePath }) {
		return posix$1.basename(globfilePath).replace("__virtual__:", "").replace(/\.[^.]+$/, "");
	}
	/**
	@param {object} args
	@param {string} args.globfilePath
	@returns {Array<{ absoluteFilepath: string, relativeFilepath: string }>}
	*/
	function getGlobfileMatchedFiles({ globfilePath }) {
		return globSync(posix$1.dirname(globfilePath).replaceAll("%21", "!"), { absolute: true }).map((absoluteMatchedFilePath) => {
			let relativeFilepath = posix$1.relative(posix$1.dirname(posix$1.dirname(globfilePath)), absoluteMatchedFilePath);
			if (!relativeFilepath.startsWith(".")) relativeFilepath = `./${relativeFilepath}`;
			return {
				absoluteFilepath: absoluteMatchedFilePath,
				relativeFilepath
			};
		});
	}
	/**
	@param {object} args
	@param {string} args.globfilePath
	@param {'module' | 'commonjs'} [args.moduleType]
	@param {'relative' | 'absolute'} [args.filepathType]
	@returns {string}
	*/
	function getGlobfileContents$1({ globfilePath, moduleType: moduleType$1 = "module", filepathType }) {
		const globfileType$1 = getGlobfileType({ globfilePath });
		const matchedFiles = getGlobfileMatchedFiles({ globfilePath });
		/** @type {string[]} */
		const virtualFileContentLines = [];
		switch (globfileType$1) {
			case "matches":
				if (moduleType$1 === "module") virtualFileContentLines.push(...matchedFiles.map((matchedFile) => `export * from ${JSON.stringify(filepathType === "relative" ? matchedFile.relativeFilepath : matchedFile.absoluteFilepath)};`));
				else virtualFileContentLines.push("module.exports = {", ...matchedFiles.map((matchedFile) => `...require(${JSON.stringify(filepathType === "relative" ? matchedFile.relativeFilepath : matchedFile.absoluteFilepath)}),`), "};");
				break;
			case "files":
				/** @param {string} filepath */
				for (const matchedFile of matchedFiles) {
					const filepath$1 = filepathType === "relative" ? matchedFile.relativeFilepath : matchedFile.absoluteFilepath;
					if (moduleType$1 === "module") virtualFileContentLines.push(`export * as ${JSON.stringify(filepath$1)} from ${JSON.stringify(filepath$1)};`);
					else {
						const filepath$2 = filepathType === "relative" ? matchedFile.relativeFilepath : matchedFile.absoluteFilepath;
						virtualFileContentLines.push("module.exports = {");
						for (const matchedFile$1 of matchedFiles) {
							const relativeFilePath = posix$1.relative(monorepoDirpath, matchedFile$1.absoluteFilepath);
							virtualFileContentLines.push(`${JSON.stringify(relativeFilePath)}: require(${JSON.stringify(filepath$2)}),`);
						}
						virtualFileContentLines.push("}");
					}
				}
				break;
			case "filepaths":
				if (moduleType$1 === "module") virtualFileContentLines.push("export default {");
				else virtualFileContentLines.push("module.exports = {");
				for (const matchedFile of matchedFiles) {
					const relativeFilePath = posix$1.relative(monorepoDirpath, matchedFile.absoluteFilepath);
					virtualFileContentLines.push(`${JSON.stringify(relativeFilePath)}: true,`);
				}
				virtualFileContentLines.push("}");
				break;
			default: throw new Error(`Unknown virtual file type: ${globfileType$1}`);
		}
		return virtualFileContentLines.join("\n");
	}
	return {
		getGlobfilePath: getGlobfilePath$1,
		getGlobfileType,
		getGlobfileMatchedFiles,
		getGlobfileContents: getGlobfileContents$1
	};
}

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
const { getGlobfileContents, getGlobfilePath } = createGlobfileManager({ monorepoDirpath: getMonorepoDirpath(filepath) });
let formattedFileLines = fileLines.slice(0, dprintReexportLineIndex).join("\n") + dprintReexportLine + "\n" + getGlobfileContents({
	globfilePath: getGlobfilePath({
		globfileModuleSpecifier: `glob${globfileType === "matches" ? "" : `[${globfileType}]`}:${globPattern}`,
		importerFilepath: filepath
	}),
	importerFilepath: filepath,
	filepathType: "relative",
	moduleType
});
if (dprintReexportEndLineIndex !== -1) formattedFileLines += "\n" + fileLines.slice(dprintReexportEndLineIndex).join("\n");
process.stdout.write(formattedFileLines);

//#endregion
export {  };