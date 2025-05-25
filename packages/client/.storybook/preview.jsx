import { BrowserRouter } from "react-router-dom";
import "../src/index.css";

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
};

export default preview;
