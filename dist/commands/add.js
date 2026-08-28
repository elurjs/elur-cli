import fs from "node:fs";
import path from "node:path";
import { blue, green, red } from "kolorist";
import { findProjectRoot, readProjectType } from "../utils/project.js";
import { renderTemplate } from "../templates/index.js";
import { toFilePath } from "../utils/naming.js";
const folders = {
    component: "src/components",
    page: "src/pages",
    store: "src/stores",
    service: "src/services",
};
const suffixes = {
    component: "",
    page: "",
    store: ".store",
    service: ".service",
};
export async function addCommand(type, name) {
    const validTypes = ["component", "page", "store", "service"];
    if (!validTypes.includes(type)) {
        console.error(red(`Tipo inválido: ${type}`));
        console.error(`Tipos válidos: ${validTypes.join(", ")}`);
        process.exit(1);
    }
    const t = type;
    const root = findProjectRoot();
    if (!root) {
        console.error(red("No se encontró un package.json. ¿Estás en un proyecto Elur?"));
        process.exit(1);
    }
    const projectType = readProjectType(root);
    if (!projectType) {
        console.error(red("No se detectó @elurjs/core ni @elurjs/ionic en este proyecto."));
        process.exit(1);
    }
    const folder = path.join(root, folders[t]);
    const fileName = `${toFilePath(name)}${suffixes[t]}.ts`;
    const filePath = path.join(folder, fileName);
    if (fs.existsSync(filePath)) {
        console.error(red(`Ya existe: ${filePath}`));
        process.exit(1);
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const vars = { name, fileName: fileName.replace(/\.ts$/, "") };
    const content = renderTemplate(t, projectType, vars);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(green(`✓ Creado ${type}:`), blue(path.relative(root, filePath)));
}
//# sourceMappingURL=add.js.map