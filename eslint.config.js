import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import unicorn from "eslint-plugin-unicorn";

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
            "@typescript-eslint": tsPlugin,
            unicorn
        },
        rules: {
            // Regras TS
            "no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "warn",

            // Regras básicas
            "eqeqeq": ["warn", "always"],
            "no-console": "warn",
            "curly": "warn",

            // Regras Unicorn (pega várias más práticas)
            "unicorn/prefer-ternary": "warn",
            "unicorn/no-array-reduce": "warn",
            "unicorn/prefer-string-replace-all": "warn",
            "unicorn/prevent-abbreviations": "warn", // reclama de nomes abreviados tipo `err`, `obj`
            "unicorn/consistent-function-scoping": "warn",
            "unicorn/no-null": "warn"
        }
    }
];
