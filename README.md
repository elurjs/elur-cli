# @elurjs/cli

CLI oficial para [Elur](https://github.com/elurjs/elur). Genera componentes, páginas, stores y servicios, y ejecuta los comandos de desarrollo, build y tests de tu proyecto.

## Instalación

No necesitas instalarlo globalmente. Usa `npx`:

```bash
npx elur add component Button
```

## Requisitos

- Node.js >= 18.0.0
- Un proyecto que use `@elurjs/core` o `@elurjs/ionic`

## Comandos

### `elur dev`

Inicia el servidor de desarrollo. Si tu `package.json` tiene un script `dev`, lo ejecuta con `npm run dev`; si no, corre `vite` directamente.

```bash
npx elur dev
```

### `elur build`

Compila la aplicación para producción. Usa `npm run build` si existe, o `vite build` como fallback.

```bash
npx elur build
```

### `elur test`

Ejecuta la suite de tests. Usa `npm run test` si existe, o `vitest` como fallback.

```bash
npx elur test
```

### `elur add <type> <name>`

Genera un nuevo archivo en la carpeta correspondiente.

| Tipo        | Carpeta de salida | Ejemplo                          |
| ----------- | ----------------- | -------------------------------- |
| `component` | `src/components/` | `npx elur add component Button` |
| `page`      | `src/pages/`      | `npx elur add page Login`       |
| `store`     | `src/stores/`     | `npx elur add store auth`       |
| `service`   | `src/services/`   | `npx elur add service api`      |

Las páginas también soportan rutas dinámicas:

```bash
npx elur add page users/[id]
# genera src/pages/users/[id].ts
```

## Detección automática del proyecto

La CLI detecta si tu proyecto usa `@elurjs/ionic` o `@elurjs/core` y elige el template adecuado:

- **Elur-Ionic**: genera componentes basados en `ElurComponent` y páginas con `ion-page`.
- **Elur base**: genera funciones simples que devuelven templates.

## Ejemplos

### Componente en proyecto Elur-Ionic

```bash
npx elur add component Button
```

Genera `src/components/Button.ts`:

```ts
import { html } from "@elurjs/core/template";
import { ElurComponent } from "@elurjs/core/lifecycle";

export class Button extends ElurComponent {
  override render() {
    return html`
      <div class="button">
        <!-- Button component -->
      </div>
    `;
  }
}
```

### Store

```bash
npx elur add store auth
```

Genera `src/stores/auth.store.ts` con `createStore` y un estado inicial de ejemplo.

### `elur ui` — componentes copiables (Elur UI)

Copia fuentes de componentes Elur UI a tu proyecto (modelo shadcn: el código copiado es tuyo). Lee `registry.json`, resuelve dependencias entre archivos e instala solo los paquetes que cada componente necesita (`@elurjs/ui-brain` + las máquinas `@zag-js/*` de los componentes headless).

```bash
npx elur ui init            # copia tokens.css, ui.css, icons.ts e index.ts a src/ui/
npx elur ui add dialog tabs # copia componentes + instala sus machineDeps
npx elur ui add --all       # todos los componentes
npx elur ui list            # catálogo disponible en el registry
```

Opciones: `--dir <dir>` (destino, default `src/ui`), `--force` (sobreescribir existentes), `--registry <path|url>` (registry local o URL — también via `ELUR_REGISTRY` o `"elur": { "registry": "..." }` en package.json; sin nada usa el repo `elurjs/registry`).

Los componentes copiados se estilizan con `[data-elur]` + `tokens.css`/`ui.css` — importa ambos en tu app.

## Cómo funciona el wrapper de ejecución

La CLI prioriza los scripts definidos en tu `package.json`. Si el script no existe, ejecuta el binario correspondiente automáticamente:

- `elur dev` → `npm run dev` → `vite`
- `elur build` → `npm run build` → `vite build`
- `elur test` → `npm run test` → `vitest`

Esto permite que un proyecto Elur tenga una experiencia de comando única, sin abandonar Vite/Vitest.

## Licencia

MIT
