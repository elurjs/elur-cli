import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
export function findProjectRoot(cwd = process.cwd()) {
    let dir = cwd;
    while (true) {
        const pkgPath = path.join(dir, "package.json");
        if (fs.existsSync(pkgPath))
            return dir;
        const parent = path.dirname(dir);
        if (parent === dir)
            return null;
        dir = parent;
    }
}
export function readProjectType(root) {
    const pkgPath = path.join(root, "package.json");
    if (!fs.existsSync(pkgPath))
        return null;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
    };
    if (allDeps["@deijose/nix-ionic"])
        return "nix-ionic";
    if (allDeps["@deijose/nix-js"])
        return "nix-js";
    return null;
}
export function __dirname() {
    return path.dirname(fileURLToPath(import.meta.url));
}
//# sourceMappingURL=project.js.map