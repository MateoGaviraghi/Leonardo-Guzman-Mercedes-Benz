import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Reglas nuevas de eslint-config-next 16.4 (react-hooks v7) que marcan código
  // que ya existía y funciona (13 casos en admin, CRM, formularios y el inicio).
  // Quedan como aviso hasta revisarlas una por una (TD-013).
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Herramientas locales de carga de datos (gitignored, no se publican).
    "carga/**",
  ]),
]);

export default eslintConfig;
