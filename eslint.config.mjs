import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'

export default tseslint.config(
  {
    ignores: ['**/build/**', '**/dist/**', '**/node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'prettier/prettier': [
        'warn',
        {
          semi: false,
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 120,
          tabWidth: 2,
          useTabs: false,
          jsxSingleQuote: false,
          arrowParens: 'always',
          bracketSpacing: true,
          endOfLine: 'lf',
          htmlWhitespaceSensitivity: 'css',
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['test/**'],
  }
)
