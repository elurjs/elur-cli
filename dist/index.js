#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { runCommand } from "./commands/run.js";
const program = new Command();
program
    .name("nixjs")
    .description("CLI for Nix.js — scaffold components, pages, stores and services")
    .version("0.1.2");
program
    .command("add <type> <name>")
    .description("Add a new component, page, store or service")
    .action(async (type, name) => {
    await addCommand(type, name);
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