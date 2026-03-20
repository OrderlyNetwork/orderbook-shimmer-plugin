import type { Meta, StoryObj } from "@storybook/react";

import { registerPlugin } from "../index";

import { OrderBookWidget, TradingPage } from "@orderly.network/trading";
import { Box, OrderlyPluginProvider } from "@orderly.network/ui";
import { useEffect, useState } from "react";
import { tradingPageConfig } from "./orderlyConfig";

import "@orderly.network/ui/dist/styles.css";
import React from "react";

const meta = {
  title: "OrderBook Shimmer Plugin",
  component: TradingPage,
  parameters: {
    layout: "centered",
  },
  args: {
    symbol: "PERP_BTC_USDC",
    tradingViewConfig: tradingPageConfig.tradingViewConfig,
    sharePnLConfig: tradingPageConfig.sharePnLConfig,
    // Keep these in args so Storybook can control plugin visuals.
    animationHighlightColor: "rgba(255, 200, 100, 0.25)",
    stripedRowBackgroundColor: "rgb(var(--oui-color-line) / 0.03)",
  },
  argTypes: {
    symbol: {
      control: "select",
      options: ["PERP_BTC_USDC", "PERP_ETH_USDC"],
    },
    animationHighlightColor: {
      control: "text",
      description:
        "CSS color string used as the animation highlight 'from' color (e.g. rgba(...) / #rrggbb).",
    },
    stripedRowBackgroundColor: {
      control: "text",
      description:
        "CSS color string used for even-row base background and as animation 'to' color (e.g. rgb(...) / var(...)).",
    },
  },
} satisfies Meta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (arg: any) => {
    const [symbol, setSymbol] = useState("PERP_BTC_USDC");

    useEffect(() => {
      // updateSymbol(symbol);
    }, [symbol]);

    return (
      <OrderlyPluginProvider
        plugins={[
          registerPlugin({
            animationHighlightColor: arg.animationHighlightColor,
            stripedRowBackgroundColor: arg.stripedRowBackgroundColor,
          }),
        ]}
      >
        <div className="oui-h-[350px] oui-m-3 oui-flex oui-items-start oui-justify-center">
          <Box className="oui-w-[350px] oui-bg-base-9" r="2xl" py={3}>
            <OrderBookWidget symbol={arg.symbol} height={350} />
          </Box>
        </div>
      </OrderlyPluginProvider>
    );
  },
  args: {},
};

export const CustomColors: Story = {
  render: (arg: any) => (
    <OrderlyPluginProvider
      plugins={[
        registerPlugin({
          animationHighlightColor: arg.animationHighlightColor,
          stripedRowBackgroundColor: arg.stripedRowBackgroundColor,
        }),
      ]}
    >
      <div className="oui-h-[400px] oui-m-3 oui-flex oui-items-start oui-justify-center">
        <Box className="oui-w-1/3 oui-bg-base-9" r="2xl" py={3}>
          <OrderBookWidget symbol={arg.symbol} />
        </Box>
      </div>
    </OrderlyPluginProvider>
  ),
  args: {
    animationHighlightColor: "rgba(0, 200, 255, 0.25)",
    stripedRowBackgroundColor: "rgb(var(--oui-color-line) / 0.06)",
  } as any,
};
