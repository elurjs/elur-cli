import { toPascalCase, toKebabCase } from "../utils/naming.js";

interface TemplateVars {
  name: string;
  fileName: string;
}

function interpolate(template: string, vars: TemplateVars): string {
  const pascal = toPascalCase(vars.name);
  const kebab = toKebabCase(vars.name);
  return template
    .replace(/\{\{Name\}\}/g, pascal)
    .replace(/\{\{kebab-name\}\}/g, kebab)
    .replace(/\{\{fileName\}\}/g, vars.fileName);
}

const baseComponent = `import { html } from "@elurjs/core/template";

export function {{Name}}() {
  return html\`
    <div class="{{kebab-name}}">
      <!-- {{Name}} component -->
    </div>
  \`;
}
`;

const ionicComponent = `import { html } from "@elurjs/core/template";
import { ElurComponent } from "@elurjs/core/lifecycle";

export class {{Name}} extends ElurComponent {
  override render() {
    return html\`
      <div class="{{kebab-name}}">
        <!-- {{Name}} component -->
      </div>
    \`;
  }
}
`;

const basePage = `import { html } from "@elurjs/core/template";

export function {{Name}}Page() {
  return html\`
    <div class="{{kebab-name}}-page">
      <!-- {{Name}} page -->
    </div>
  \`;
}
`;

const ionicPage = `import { html } from "@elurjs/core/template";
import { ElurComponent } from "@elurjs/core/lifecycle";

export class {{Name}}Page extends ElurComponent {
  override render() {
    return html\`
      <ion-page class="{{kebab-name}}-page">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{Name}}</ion-title>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <!-- {{Name}} page -->
        </ion-content>
      </ion-page>
    \`;
  }
}
`;

const store = `import { createStore } from "@elurjs/core";

export const {{Name}}Store = createStore(
  {
    // initial state
    items: [] as any[],
    loading: false,
    error: null as string | null,
  },
  {
    name: "{{kebab-name}}",
    actions: (s) => ({
      // async fetch() {
      //   s.loading.update(() => true);
      //   try {
      //     const data = await fetch("/api/{{kebab-name}}").then((r) => r.json());
      //     s.items.update(() => data);
      //   } catch (err: any) {
      //     s.error.update(() => err.message);
      //   } finally {
      //     s.loading.update(() => false);
      //   }
      // },
    }),
  },
);
`;

const service = `export class {{Name}}Service {
  // async getAll() {
  //   return fetch("/api/{{kebab-name}}").then((r) => r.json());
  // }
}

export const {{camelName}}Service = new {{Name}}Service();
`;

const templates: Record<
  "elur" | "elur-ionic",
  Record<"component" | "page" | "store" | "service", string>
> = {
  "elur": {
    component: baseComponent,
    page: basePage,
    store,
    service,
  },
  "elur-ionic": {
    component: ionicComponent,
    page: ionicPage,
    store,
    service,
  },
};

export function renderTemplate(
  type: "component" | "page" | "store" | "service",
  projectType: "elur" | "elur-ionic",
  vars: TemplateVars
): string {
  const template = templates[projectType][type];
  const pascal = toPascalCase(vars.name);
  const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  return interpolate(template, vars).replace(/\{\{camelName\}\}/g, camel);
}
