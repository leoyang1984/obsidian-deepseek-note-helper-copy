module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-floating-promises': 'error'
  },
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
};
