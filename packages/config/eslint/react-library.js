import baseConfig from "./base.js";

/** @type {import("typescript-eslint").Config} */
export default [
  ...baseConfig,
  {
    rules: {
      "react/prop-types": "off",
    },
  },
];
