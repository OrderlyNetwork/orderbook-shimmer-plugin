import { createInterceptor } from "@orderly.network/ui"
import { OrderlySDK } from "@orderly.network/ui"
import { OrderBookListWrapper } from "./components/orderbook"
import type { OrderBookShimmerPluginOptions } from "./components/orderbook"

const DEFAULT_PLUGIN_OPTIONS: OrderBookShimmerPluginOptions = {
  animationHighlightColor: "rgba(255, 200, 100, 0.25)",
  stripedRowBackgroundColor: "rgb(var(--oui-color-line) / 0.03)",
};

/**
 * Plugin registration: adds shimmer effect to desktop orderbook asks/bids.
 */
export function registerPlugin(
  options?: Partial<OrderBookShimmerPluginOptions>,
) {
  return (SDK: OrderlySDK) => {
    const pluginOptions: OrderBookShimmerPluginOptions = {
      ...DEFAULT_PLUGIN_OPTIONS,
      ...options,
    };

    SDK.registerPlugin({
      id: "orderly-orderbook-shimmer-plugin",
      name: "OrderBook Shimmer Plugin",
      version: "0.0.1",
      orderlyVersion: ">=3.0.0",
      interceptors: [
        createInterceptor("OrderBook.Desktop.Asks", (Original, props, _api) => (
          <OrderBookListWrapper
            Original={Original}
            props={props}
            pluginOptions={pluginOptions}
          />
        )),
        createInterceptor("OrderBook.Desktop.Bids", (Original, props, _api) => (
          <OrderBookListWrapper
            Original={Original}
            props={props}
            pluginOptions={pluginOptions}
          />
        )),
      ],
    });
  };
}
