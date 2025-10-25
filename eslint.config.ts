import pluginCypress from 'eslint-plugin-cypress/flat'
import pluginUnicorn from 'eslint-plugin-unicorn'
import pluginVue from 'eslint-plugin-vue'
import { globalIgnores } from 'eslint/config'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,vue}'],
    plugins: {
      unicorn: pluginUnicorn,
    },
    rules: {
      // Enforce kebab-case for files except .vue
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
        },
      ],
      // Allow underscore variable names
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // Allow PascalCase for .vue files and component test files
  {
    files: [
      '**/*.vue',
      'src/components/__tests__/**/*',
      'src/pages/__tests__/**/*',
      'src/layouts/__tests__/**/*',
    ],
    rules: {
      'unicorn/filename-case': 'off',
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/**/*', 'tests/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    ...pluginCypress.configs.recommended,
    files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}', 'cypress/support/**/*.{js,ts,jsx,tsx}'],
  },
  skipFormatting
)
