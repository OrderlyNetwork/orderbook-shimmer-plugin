# @orderly.network/template

Template project for quickly creating new `@orderly.network/*` React component packages. It comes with:

- **Basic example component**: exports a `hello` component built with `@orderly.network/ui`
- **i18n integration**: external locale loading powered by `@orderly.network/i18n`
- **Style build pipeline**: uses `tailwindcss` to build `dist/styles.css`

## Installation

In your target project (or when consuming this package from a monorepo):

```bash
pnpm add @orderly.network/template
```

This template declares the following peerDependencies (must be provided by the consumer app):

- `@orderly.network/hooks >= 2.10.1`
- `@orderly.network/i18n >= 2.10.1`
- `@orderly.network/ui >= 2.10.1`
- `react >= 18`
- `react-dom >= 18`

## Exports

The entry file `src/index.ts` currently exports:

- **Example component**
  - `hello`: a simple React component that renders a `Box` from `@orderly.network/ui`
- **i18n utilities**
  - `TemplateLocaleProvider`: an external locale provider that lazily loads package-level locale resources
  - `TemplateLocales`: the default locale object (for example `Common.ok`)

### Using the example component

```tsx
import { hello } from "@orderly.network/template";

export function App() {
  return <>{hello()}</>;
}
```

### Using the i18n provider

`TemplateLocaleProvider` is implemented on top of `ExternalLocaleProvider` from `@orderly.network/i18n`:

```tsx
import { TemplateLocaleProvider } from "@orderly.network/template";

export function Root() {
  return <TemplateLocaleProvider>{/* your app here */}</TemplateLocaleProvider>;
}
```

Under the hood it will:

- Call `preloadDefaultResource(TemplateLocales)` to preload default messages
- Dynamically `import ./locales/${lang}.json` based on the current `LocaleCode`

You can add or extend locale JSON files under `src/i18n/locales` and keep them compatible with the `TemplateLocales` type.

## Styles & build

This template ships with a minimal `tailwindcss` setup:

- `src/tailwind.css` contains
  - `@tailwind components;`
  - `@tailwind utilities;`

Build commands:

- **Build components and styles**

```bash
pnpm build
```

This is equivalent to:

- Using `tsup` to build `dist/index.js`, `dist/index.mjs`, and `dist/index.d.ts`
- Using `tailwindcss` to build `dist/styles.css`

## How to use this as a new package template

When creating a new Orderly frontend package, you can:

1. **Copy this directory** to a new package folder, then update the following fields in `package.json`:
   - `name`
   - `version`
   - `description`
2. **Replace the example component**
   - Add/modify your actual components under `src/components`
   - Export them from `src/index.ts`
3. **Adjust i18n as needed**
   - Update `TemplateLocales` and its type in `src/i18n/module.ts`
   - Add matching locale JSON files under `src/i18n/locales`
4. **Extend styles as needed**
   - Update `src/tailwind.css` with your own Tailwind layers or utilities
   - Or integrate other style solutions and wire them into the build step

## Publishing

`package.json` is configured with:

- `prepublishOnly`: automatically runs `pnpm build` before `pnpm publish`
- `files`: only publishes `dist`, `package.json`, and `README.md`

After you finish implementing and testing your new package, you can run (from the workspace root or the package directory):

```bash
pnpm publish --filter @orderly.network/your-package-name
```

Using `@orderly.network/template` as a starting point helps you quickly bootstrap new Orderly packages with a consistent structure, built-in i18n wiring, and a Tailwind-based style build.
