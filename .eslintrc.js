module.exports = {
    root: true,
    env: {
        es2021: true,
        node: true,
    },
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    extends: ['eslint:recommended'],
    overrides: [
        {
            files: ['GPT5/**/src/**/*.{ts,tsx}', 'Claude4/**/src/**/*.{ts,tsx}'],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint', 'sonarjs'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:sonarjs/recommended',
            ],
        },
        {
            files: ['**/*.test.{js,ts}'],
            env: { jest: true },
        },
    ],
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
        'sonarjs/cognitive-complexity': ['warn', 15],
    },
};
