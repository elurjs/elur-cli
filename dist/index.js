#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add.js";
const program = new Command();
program
    .name("nixjs")
    .description("CLI for Nix.js — scaffold components, pages, stores and services")
    .version("0.1.0");
program
    .command("add <type> <name>")
    .description("Add a new component, page, store or service")
    .action(async (type, name) => {
    await addCommand(type, name);
});
program.parse();
//# sourceMappingURL=index.js.map