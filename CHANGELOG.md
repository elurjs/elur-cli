# Changelog

All notable changes to this project will be documented in this file.

## v0.2.0

New `elur ui` command group — copies Elur UI component sources into the
consuming project (shadcn-style: the code becomes yours), resolving
dependencies from `registry.json` and installing only the packages each
component actually needs.

### Added

- **`elur ui init`** — copies the base files (`tokens.css`, `ui.css`,
  `icons.ts`, `index.ts`) into `src/ui/` and ensures `@elurjs/core` +
  `@elurjs/ui-brain` are installed.
- **`elur ui add <names...>`** — copies components with their transitive
  file `dependencies`, then installs `@elurjs/ui-brain` (when needed) +
  each component's `machineDeps` (`@zag-js/*`, `@floating-ui/dom`).
  `--all` copies every component.
- **`elur ui list`** — lists the registry manifest with types and
  descriptions.
- **Registry resolution** — `--registry <path|url>` flag,
  `ELUR_REGISTRY` env var, `"elur": { "registry": "..." }` in
  package.json, or a sibling `../registry` directory. Falls back to the
  published `elurjs/registry` repo on GitHub.
- **Package manager detection** — `bun add` / `pnpm add` / `yarn add` /
  `npm install` picked from the project lockfile; existing deps are
  skipped and install failures print the manual command instead of
  aborting the copy.
- `--dir` to change the target (default `src/ui`), `--force` to
  overwrite existing files (default skips them).

## v0.1.2

- Scaffold `add` command for component/page/store/service templates
  (elur and elur-ionic project types).
- `dev`/`build`/`test` wrappers that prefer package.json scripts and
  fall back to vite/vitest binaries.
