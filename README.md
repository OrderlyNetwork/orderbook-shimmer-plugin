# OrderBook Shimmer Plugin

This package adds a desktop orderbook "shimmer/flash" effect to Orderly by intercepting the rendered orderbook lists and applying CSS animations when visible values change.

## What it intercepts

The plugin registers two interceptors:

- `OrderBook.Desktop.Asks`
- `OrderBook.Desktop.Bids`

## Install

In your target project (or when consuming from a monorepo):

```bash
pnpm add @orderly.network/orderbook-shimmer-plugin
```

## Developer integration (recommended)

### 1) Import styles

The flash/stripe styles are built into `dist/styles.css`. Import them once in your app (e.g. in your root layout).

```ts
import "@orderly.network/orderbook-shimmer-plugin/dist/styles.css";
```

### 2) Register the plugin via `OrderlyAppProvider`

Use `registerPlugin()` and pass it in the `plugins` array.

```tsx
import { registerPlugin } from "@orderly.network/orderbook-shimmer-plugin";

export function Root() {
  return (
    <OrderlyAppProvider
      plugins={[
        registerPlugin({
          animationHighlightColor: "rgba(255, 200, 100, 0.25)",
          stripedRowBackgroundColor: "rgb(var(--oui-color-line) / 0.03)",
        }),
        //... other plugins
      ]}
    >
      {/* Your app content */}
    </OrderlyAppProvider>
  );
}
```

## Plugin options

`registerPlugin(options?: Partial<OrderBookShimmerPluginOptions>)`

Compatibility: the plugin registers with `orderlyVersion: ">=3.0.0"`.

`options` is optional: pass nothing to use defaults, or pass a partial object to override only the colors.

### Options

- `animationHighlightColor`
  - Default: `rgba(255, 200, 100, 0.25)`
  - Used as the CSS animation "from" color.
- `stripedRowBackgroundColor`
  - Default: `rgb(var(--oui-color-line) / 0.03)`
  - Used as:
    - the even-row base background color
    - the animation "to" color for even rows

### Type exports

This package exports the `OrderBookShimmerPluginOptions` type from `src/components/orderbook.tsx`.

```ts
import type { OrderBookShimmerPluginOptions } from "@orderly.network/orderbook-shimmer-plugin";
```

## Behavior notes

- The wrapper diffs rows using display-precision rounding (so flashes match what the UI shows).
- Flash animations do not run on the initial mount (or first precision change after mount).
- Only the desktop orderbook asks/bids are affected; other views/components are not intercepted.
