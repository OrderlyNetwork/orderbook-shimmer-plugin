import React from "react";
import type { Preview } from "@storybook/react";
import { OrderlyForStoryBookProvider } from "./orderlyForStoryBookProvider";

// Ensure Tailwind directives in `src/tailwind.css` are processed in Storybook.
import "../src/tailwind.css";

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        OrderlyForStoryBookProvider,
        null,
        React.createElement(Story as any),
      ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

