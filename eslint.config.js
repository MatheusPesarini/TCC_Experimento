import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "warn",
      "eqeqeq": ["warn", "always"],              // exige === em vez de ==
      "curly": "warn",                          // obriga usar chaves em if/while
      "complexity": ["warn", 5],                // alerta funções muito complexas
      "max-lines": ["warn", 200],               // alerta arquivos grandes
      "max-depth": ["warn", 3],                 // alerta muitos níveis de aninhamento
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn"
    }
  }
];
