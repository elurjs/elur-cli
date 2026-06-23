# @deijose/nix-cli

CLI oficial para [Nix.js](https://github.com/DeijoseDevelop/nix-js). Genera componentes, páginas, stores y servicios, y ejecuta los comandos de desarrollo, build y tests de tu proyecto.

## Instalación

No necesitas instalarlo globalmente. Usa `npx`:

```bash
npx nixjs add component Button
```

## Requisitos

- Node.js >= 18.0.0
- Un proyecto que use `@deijose/nix-js` o `@deijose/nix-ionic`

## Comandos

### `nixjs dev`

Inicia el servidor de desarrollo. Si tu `package.json` tiene un script `dev`, lo ejecuta con `npm run dev`; si no, corre `vite` directamente.

```bash
npx nixjs dev
```

### `nixjs build`

Compila la aplicación para producción. Usa `npm run build` si existe, o `vite build` como fallback.

```bash
npx nixjs build
```

### `nixjs test`

Ejecuta la suite de tests. Usa `npm run test` si existe, o `vitest` como fallback.

```bash
npx nixjs test
```

### `nixjs add <type> <name>`

Genera un nuevo archivo en la carpeta correspondiente.

| Tipo        | Carpeta de salida | Ejemplo                          |
| ----------- | ----------------- | -------------------------------- |
| `component` | `src/components/` | `npx nixjs add component Button` |
| `page`      | `src/pages/`      | `npx nixjs add page Login`       |
| `store`     | `src/stores/`     | `npx nixjs add store auth`       |
| `service`   | `src/services/`   | `npx nixjs add service api`      |

Las páginas también soportan rutas dinámicas:

```bash
npx nixjs add page users/[id]
# genera src/pages/users/[id].ts
```

## Detección automática del proyecto

La CLI detecta si tu proyecto usa `@deijose/nix-ionic` o `@deijose/nix-js` y elige el template adecuado:

- **Nix-Ionic**: genera componentes basados en `NixComponent` y páginas con `ion-page`.
- **Nix.js base**: genera funciones simples que devuelven templates.

## Ejemplos

### Componente en proyecto Nix-Ionic

```bash
npx nixjs add component Button
```

Genera `src/components/Button.ts`:

```ts
import { html } from "@deijose/nix-js/template";
import { NixComponent } from "@deijose/nix-js/lifecycle";

export class Button extends NixComponent {
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
npx nixjs add store auth
```

Genera `src/stores/auth.store.ts` con `createStore` y un estado inicial de ejemplo.

## Cómo funciona el wrapper de ejecución

La CLI prioriza los scripts definidos en tu `package.json`. Si el script no existe, ejecuta el binario correspondiente automáticamente:

- `nixjs dev` → `npm run dev` → `vite`
- `nixjs build` → `npm run build` → `vite build`
- `nixjs test` → `npm run test` → `vitest`

Esto permite que un proyecto Nix.js tenga una experiencia de comando única, sin abandonar Vite/Vitest.

## Licencia

MIT
