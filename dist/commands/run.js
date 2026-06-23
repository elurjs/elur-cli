import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { blue, cyan, red } from "kolorist";
import { findProjectRoot } from "../utils/project.js";
const runners = {
    dev: { script: "dev", binary: "vite", args: [] },
    build: { script: "build", binary: "vite", args: ["build"] },
    test: { script: "test", binary: "vitest", args: [] },
};
function hasScript(root, script) {
    const pkgPath = path.join(root, "package.json");
    if (!fs.existsSync(pkgPath))
        return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return !!pkg.scripts?.[script];
}
function hasBinary(root, binary) {
    const localBin = path.join(root, "node_modules", ".bin", binary);
    return fs.existsSync(localBin);
}
export function runCommand(command) {
    const root = findProjectRoot();
    if (!root) {
        console.error(red("No se encontró un package.json. ¿Estás en un proyecto Nix.js?"));
        process.exit(1);
    }
    const runner = runners[command];
    if (hasScript(root, runner.script)) {
        console.log(cyan(`> npm run ${runner.script}`));
        const child = spawn("npm", ["run", runner.script], {
            cwd: root,
            stdio: "inherit",
            shell: true,
        });
        child.on("exit", (code) => process.exit(code ?? 0));
        return;
    }
    if (hasBinary(root, runner.binary)) {
        const args = [runner.binary, ...runner.args];
        console.log(cyan(`> ${args.join(" ")}`));
        const child = spawn("npx", args, {
            cwd: root,
            stdio: "inherit",
            shell: true,
        });
        child.on("exit", (code) => process.exit(code ?? 0));
        return;
    }
    console.error(red(`No se encontró el script "${runner.script}" ni el binario "${runner.binary}".`));
    console.error(blue(`Instala ${runner.binary} con: npm install -D ${runner.binary}`));
    process.exit(1);
}
//# sourceMappingURL=run.js.map