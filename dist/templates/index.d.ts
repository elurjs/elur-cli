export interface TemplateVars {
    name: string;
    fileName: string;
}
export declare const templates: Record<"elur" | "elur-ionic", Record<"component" | "page" | "store" | "service", string>>;
export declare function renderTemplate(type: "component" | "page" | "store" | "service", projectType: "elur" | "elur-ionic", vars: TemplateVars): string;
//# sourceMappingURL=index.d.ts.map