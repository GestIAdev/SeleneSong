module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    // Selene Song Core specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prettier/prettier': 'error',

    // Disable some rules that might be too strict for Selene
    '@typescript-eslint/no-var-requires': 'off',
    'no-console': 'off', // Selene uses console for logging
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'dist-esm/',
    'profiling/',
    '*.js', // Ignore JS files, focus on TS
    '*.d.ts'
  ]
};
