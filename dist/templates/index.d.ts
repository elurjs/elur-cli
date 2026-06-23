export interface TemplateVars {
    name: string;
    fileName: string;
}
export declare const templates: Record<"nix-js" | "nix-ionic", Record<"component" | "page" | "store" | "service", string>>;
export declare function renderTemplate(type: "component" | "page" | "store" | "service", projectType: "nix-js" | "nix-ionic", vars: TemplateVars): string;
//# sourceMappingURL=index.d.ts.map