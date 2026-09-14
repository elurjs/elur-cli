import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { blue, green, red, yellow } from "kolorist";
import { findProjectRoot } from "../utils/project.js";

const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/elurjs/registry/main";

interface RegistryFile {
  name: string;
  type: string;
  path: string;
  target: string;
  dependencies?: string[];
  brainImports?: string[];
  machineDeps?: string[];
  description?: string;
}

interface RegistryManifest {
  name: string;
  version: string;
  files: RegistryFile[];
}

interface UiOptions {
  dir?: string;
  registry?: string;
  force?: boolean;
  all?: boolean;
}

interface Source {
  kind: "local" | "remote";
  base: string;
}

function resolveSource(opts: UiOptions, root: string): Source {
  const explicit =
    opts.registry ??
    process.env.ELUR_REGISTRY ??
    readPkgRegistry(root);
  if (explicit) {
    if (/^https?:\/\//.test(explicit)) {
      return { kind: "remote", base: explicit.replace(/\/$/, "") };
    }
    const abs = path.resolve(root, explicit);
    return { kind: "local", base: abs };
  }
  const sibling = path.resolve(root, "../registry");
  if (fs.existsSync(path.join(sibling, "registry.json"))) {
    return { kind: "local", base: sibling };
  }
  return { kind: "remote", base: DEFAULT_REGISTRY_URL };
}

function readPkgRegistry(root: string): string | undefined {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf-8")
    ) as { elur?: { registry?: string } };
    return pkg.elur?.registry;
  } catch {
    return undefined;
  }
}

async function readRegistryFile(src: Source, rel: string): Promise<string> {
  if (src.kind === "local") {
    return fs.readFileSync(path.join(src.base, rel), "utf-8");
  }
  const res = await fetch(`${src.base}/${rel}`);
  if (!res.ok) {
    throw new Error(`No se pudo obtener ${rel} (${res.status})`);
  }
  return res.text();
}

async function loadManifest(src: Source): Promise<RegistryManifest> {
  const raw = await readRegistryFile(src, "registry.json");
  return JSON.parse(raw) as RegistryManifest;
}

function detectPm(root: string): string {
  if (fs.existsSync(path.join(root, "bun.lock"))) return "bun add";
  if (fs.existsSync(path.join(root, "pnpm-lock.yaml"))) return "pnpm add";
  if (fs.existsSync(path.join(root, "yarn.lock"))) return "yarn add";
  return "npm install";
}

function pkgHasDep(root: string, dep: string): boolean {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf-8")
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return Boolean(
      pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep]
    );
  } catch {
    return false;
  }
}

function installDeps(root: string, deps: string[]) {
  const missing = deps.filter((d) => !pkgHasDep(root, d));
  if (missing.length === 0) return;
  const pm = detectPm(root);
  console.log(blue(`Instalando: ${missing.join(" ")}`));
  try {
    execSync(`${pm} ${missing.join(" ")}`, { cwd: root, stdio: "inherit" });
  } catch {
    console.log(
      yellow(
        `La instalación automática falló. Ejecuta manualmente: ${pm} ${missing.join(" ")}`
      )
    );
  }
}

function targetDir(root: string, opts: UiOptions): string {
  return path.resolve(root, opts.dir ?? "src/ui");
}

async function copyEntry(
  src: Source,
  entry: RegistryFile,
  destRoot: string,
  opts: UiOptions,
  written: Set<string>
): Promise<void> {
  const dest = path.join(destRoot, path.basename(entry.target));
  if (written.has(dest)) return;
  if (fs.existsSync(dest) && !opts.force) {
    console.log(yellow(`· existe, se omite: ${path.basename(dest)} (usa --force para sobreescribir)`));
    written.add(dest);
    return;
  }
  const content = await readRegistryFile(src, entry.path);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content, "utf-8");
  written.add(dest);
  console.log(green("✓"), path.relative(process.cwd(), dest));
}

/** Copia un entry + sus dependencias transitivas de archivos del registry. */
async function copyWithDeps(
  src: Source,
  manifest: RegistryManifest,
  entry: RegistryFile,
  destRoot: string,
  opts: UiOptions,
  written: Set<string>
): Promise<void> {
  for (const depName of entry.dependencies ?? []) {
    const dep = manifest.files.find((f) => f.name === depName);
    if (!dep) {
      console.log(yellow(`· dependencia desconocida en manifest: ${depName}`));
      continue;
    }
    await copyWithDeps(src, manifest, dep, destRoot, opts, written);
  }
  await copyEntry(src, entry, destRoot, opts, written);
}

function collectMachineDeps(
  manifest: RegistryManifest,
  names: string[]
): string[] {
  const deps = new Set<string>();
  const visit = (name: string) => {
    const entry = manifest.files.find((f) => f.name === name);
    if (!entry) return;
    for (const d of entry.machineDeps ?? []) deps.add(d);
    for (const d of entry.dependencies ?? []) visit(d);
  };
  names.forEach(visit);
  return [...deps];
}

function usesBrain(manifest: RegistryManifest, names: string[]): boolean {
  const seen = new Set<string>();
  const visit = (name: string): boolean => {
    if (seen.has(name)) return false;
    seen.add(name);
    const entry = manifest.files.find((f) => f.name === name);
    if (!entry) return false;
    if ((entry.brainImports ?? []).length > 0) return true;
    return (entry.dependencies ?? []).some(visit);
  };
  return names.some(visit);
}

const BASE_FILES = ["tokens.css", "ui.css", "icons", "index"];

export async function uiInitCommand(opts: UiOptions) {
  const root = findProjectRoot();
  if (!root) {
    console.error(red("No se encontró un package.json."));
    process.exit(1);
  }
  const src = resolveSource(opts, root);
  const manifest = await loadManifest(src);
  const dest = targetDir(root, opts);
  const written = new Set<string>();

  console.log(blue(`Registry: ${src.base} (${manifest.name}@${manifest.version})`));
  for (const name of BASE_FILES) {
    const entry = manifest.files.find((f) => f.name === name);
    if (entry) await copyEntry(src, entry, dest, opts, written);
  }
  installDeps(root, ["@elurjs/core", "@elurjs/ui-brain"]);
  console.log(
    green("\nListo.") +
    ` Importa los estilos en tu app:\n  import "./ui/tokens.css";\n  import "./ui/ui.css";`
  );
}

export async function uiAddCommand(names: string[], opts: UiOptions) {
  const root = findProjectRoot();
  if (!root) {
    console.error(red("No se encontró un package.json."));
    process.exit(1);
  }
  const src = resolveSource(opts, root);
  const manifest = await loadManifest(src);
  const dest = targetDir(root, opts);
  const written = new Set<string>();

  const wanted = opts.all
    ? manifest.files.filter((f) => f.type === "component").map((f) => f.name)
    : names;

  const unknown = wanted.filter(
    (n) => !manifest.files.some((f) => f.name === n)
  );
  if (unknown.length > 0) {
    console.error(red(`Componentes desconocidos: ${unknown.join(", ")}`));
    console.error(
      `Disponibles: ${manifest.files
        .filter((f) => f.type === "component")
        .map((f) => f.name)
        .join(", ")}`
    );
    process.exit(1);
  }

  for (const name of wanted) {
    const entry = manifest.files.find((f) => f.name === name)!;
    await copyWithDeps(src, manifest, entry, dest, opts, written);
  }

  const deps = collectMachineDeps(manifest, wanted);
  if (usesBrain(manifest, wanted)) deps.unshift("@elurjs/ui-brain");
  if (deps.length > 0) installDeps(root, deps);

  if (written.size === 0) {
    console.log(yellow("Nada que copiar."));
  }
}

export async function uiListCommand(opts: UiOptions) {
  const root = findProjectRoot() ?? process.cwd();
  const src = resolveSource(opts, root);
  const manifest = await loadManifest(src);
  console.log(blue(`${manifest.name}@${manifest.version}`));
  for (const f of manifest.files) {
    const tag =
      f.type === "component" ? green(f.name) : `${f.name} (${f.type})`;
    console.log(`  ${tag.padEnd(40)} ${f.description ?? ""}`);
  }
}
