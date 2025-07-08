module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',      // use your TS config
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',   // TS rules
    'plugin:prettier/recommended'              // integrates Prettier & disables conflicting ESLint rules
  ],
  env: {
    node: true,
    es2020: true,
    jest: true
  },
  rules: {
    // — Your custom rule tweaks go here —
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // e.g. turn off explicit function return type if you prefer inference:
    // '@typescript-eslint/explicit-function-return-type': 'off'
  },
  ignorePatterns: ['dist/', 'node_modules/'],
};

