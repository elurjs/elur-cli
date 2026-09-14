#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { runCommand } from "./commands/run.js";
import { uiAddCommand, uiInitCommand, uiListCommand, } from "./commands/ui.js";
const program = new Command();
program
    .name("elur")
    .description("CLI for Elur — scaffold components, pages, stores and services")
    .version("0.2.0");
program
    .command("add <type> <name>")
    .description("Add a new component, page, store or service")
    .action(async (type, name) => {
    await addCommand(type, name);
});
const ui = program
    .command("ui")
    .description("Elur UI — copy components, tokens and styles into your project");
ui.command("init")
    .description("Copy tokens.css, ui.css, icons and the ui barrel into src/ui/")
    .option("--dir <dir>", "target directory", "src/ui")
    .option("--registry <path|url>", "registry directory or URL override")
    .option("--force", "overwrite existing files")
    .action(async (opts) => {
    await uiInitCommand(opts);
});
ui.command("add [names...]")
    .description("Copy UI components into your project")
    .option("--all", "copy every component")
    .option("--dir <dir>", "target directory", "src/ui")
    .option("--registry <path|url>", "registry directory or URL override")
    .option("--force", "overwrite existing files")
    .action(async (names, opts) => {
    if (names.length === 0 && !opts.all) {
        console.error("Uso: elur ui add <componente...> | --all");
        process.exit(1);
    }
    await uiAddCommand(names, opts);
});
ui.command("list")
    .description("List the files available in the registry")
    .option("--registry <path|url>", "registry directory or URL override")
    .action(async (opts) => {
    await uiListCommand(opts);
});
program
    .command("dev")
    .description("Start the development server")
    .action(() => runCommand("dev"));
program
    .command("build")
    .description("Build the application for production")
    .action(() => runCommand("build"));
program
    .command("test")
    .description("Run the test suite")
    .action(() => runCommand("test"));
program.parse();
//# sourceMappingURL=index.js.map