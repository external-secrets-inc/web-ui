import type { Preview } from "@storybook/react";
import React from 'react';
import { withThemeByClassName } from '@storybook/addon-themes';
import '../src/index.css'; // Import your global styles

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      story: {
        inline: true,
        iframeHeight: "auto",
      },
    },
    options: {
      storySort: {
        order: [
          "UI",
          [
            "DataProvider",
            [
              "Documentation",
              "*",
              "DataGrid",
              "DataSearch",
              "DataSort",
              "DataTable",
            ],
          ],
          "*",
        ],
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
      parentSelector: "html",
    }),
    (Story) => (
      <>
        <style>
          {`
            #storybook-root {
              width: 100%;
              display: grid;
              justify-items: center;
            }
            .docs-story {
              background-color: hsl(var(--background)) !important;
            }
          `}
        </style>
        <Story />
      </>
    ),
  ],
};

export default preview;