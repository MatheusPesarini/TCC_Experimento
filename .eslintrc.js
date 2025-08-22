module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'google'
    ],
    env: {
        node: true,
        es2022: true,
        jest: true
    },
    rules: {
        // Google style customizations
        'max-len': ['error', { code: 100, tabWidth: 2 }],
        'indent': ['error', 2],
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off',

        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-implicit-any-catch': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',

        // Code quality rules
        'no-console': 'warn',
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-arrow-callback': 'error'
    },
    ignorePatterns: [
        'dist/',
        'node_modules/',
        'coverage/',
        '*.js'
    ]
};
