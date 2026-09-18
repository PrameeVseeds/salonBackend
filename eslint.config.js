import eslint from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "uploads/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      // TypeScript resolves globals and type-only namespaces through tsconfig.
      "no-undef": "off",
      // The project does not enable TypeScript's noUnusedLocals/noUnusedParameters checks.
      "no-unused-vars": "off",
      "no-extra-boolean-cast": "off",
    },
  },
];
