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
        iframeHeight: 'auto',
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
      parentSelector: 'html',
    }),
    (Story) => (
      <>
        <style>
          {`
            .docs-story {
              background-color: hsl(var(--background)) !important;
            }
          `}
        </style>
        <div className="p-4">
          <Story />
        </div>
      </>
    ),
  ],
};

export default preview;