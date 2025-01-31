import React from "react";
import "../src/index.css";
import { Layout } from "../src/components/Layout";

/** @type {import('@storybook/react').Preview} */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      // Skip layout if the story explicitly disables it
      if (context.parameters.layout?.decorator === false) {
        return <Story />;
      }
      return (
        <Layout>
          <Story />
        </Layout>
      );
    },
  ],
};

export default preview;
