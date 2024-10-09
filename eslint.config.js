import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      // "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      indent: ["error", 2],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      // "comma-dangle": ["error", "always-multiline"],
      "arrow-parens": ["error", "always"],
      "max-len": ["warn", { code: 100 }],
      "no-restricted-globals": [
        "warn",
        "window",
        "document",
        "navigator",
        "localStorage",
        "sessionStorage",
        "XMLHttpRequest",
      ],
    },
  },
];
