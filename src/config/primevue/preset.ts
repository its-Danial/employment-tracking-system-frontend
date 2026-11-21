import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/**
 * Passport theme: green cover, gold print, paper pages.
 * Gold lives in Tailwind (theme.css) only, PrimeVue components never use it.
 */
const Passport = definePreset(Aura, {
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
    // Company colour sits at 500, the same stop a company's own colour takes (see preset store)
    passport: {
      50: '#eef5f2',
      100: '#d5e8e0',
      200: '#abd0c1',
      300: '#6fa892',
      400: '#2f7a63',
      500: '#0e4a3a',
      600: '#0b3f31',
      700: '#093428',
      800: '#072920',
      900: '#051e17',
      950: '#03120e',
    },
    // Neutrals with a trace of green, so grey never looks borrowed from another app
    paper: {
      0: '#ffffff',
      50: '#f6f7f4',
      100: '#eceeea',
      200: '#dde2dc',
      300: '#c3cac3',
      400: '#9aa39c',
      500: '#747e77',
      600: '#57615a',
      700: '#3f4842',
      800: '#29302c',
      900: '#1a201d',
      950: '#111613',
    },
  },
  semantic: {
    primary: {
      50: '{passport.50}',
      100: '{passport.100}',
      200: '{passport.200}',
      300: '{passport.300}',
      400: '{passport.400}',
      500: '{passport.500}',
      600: '{passport.600}',
      700: '{passport.700}',
      800: '{passport.800}',
      900: '{passport.900}',
      950: '{passport.950}',
    },
    focusRing: {
      width: '2px',
      offset: '2px',
    },
    formField: {
      paddingX: '0.75rem',
      paddingY: '0.625rem',
    },
    colorScheme: {
      light: {
        surface: {
          0: '{paper.0}',
          50: '{paper.50}',
          100: '{paper.100}',
          200: '{paper.200}',
          300: '{paper.300}',
          400: '{paper.400}',
          500: '{paper.500}',
          600: '{paper.600}',
          700: '{paper.700}',
          800: '{paper.800}',
          900: '{paper.900}',
          950: '{paper.950}',
        },
        primary: {
          color: '{primary.500}',
          contrastColor: '{surface.0}',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.800}',
          focusColor: '{primary.900}',
        },
        text: {
          color: '{surface.900}',
          hoverColor: '{surface.950}',
          mutedColor: '{surface.600}',
          hoverMutedColor: '{surface.700}',
        },
        formField: {
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.500}',
          color: '{surface.900}',
          placeholderColor: '{surface.400}',
          shadow: 'none',
        },
      },
      dark: {
        surface: {
          0: '{paper.0}',
          50: '{paper.50}',
          100: '{paper.100}',
          200: '{paper.200}',
          300: '{paper.300}',
          400: '{paper.400}',
          500: '{paper.500}',
          600: '{paper.600}',
          700: '{paper.700}',
          800: '{paper.800}',
          900: '{paper.900}',
          950: '{paper.950}',
        },
        primary: {
          color: '{primary.300}',
          contrastColor: '{primary.950}',
          hoverColor: '{primary.200}',
          activeColor: '{primary.100}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.300}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.300}, transparent 76%)',
          color: '{primary.100}',
          focusColor: '{primary.50}',
        },
        text: {
          color: '{surface.100}',
          hoverColor: '{surface.0}',
          mutedColor: '{surface.400}',
          hoverMutedColor: '{surface.300}',
        },
        formField: {
          background: '{surface.950}',
          borderColor: '{surface.700}',
          hoverBorderColor: '{surface.500}',
          placeholderColor: '{surface.500}',
          shadow: 'none',
        },
      },
    },
  },
  components: {
    // Tables sit straight on the page sheet: quiet headers, hairline rows, no boxed sorted column
    datatable: {
      headerCell: {
        color: '{text.muted.color}',
        hoverColor: '{text.color}',
        selectedBackground: 'transparent',
        selectedColor: '{text.color}',
        padding: '0.625rem 1rem',
      },
      columnTitle: {
        fontWeight: '500',
      },
      bodyCell: {
        padding: '0.875rem 1rem',
      },
      colorScheme: {
        light: {
          row: { hoverBackground: '{surface.50}' },
        },
        dark: {
          row: { hoverBackground: '{surface.800}' },
        },
      },
    },
    paginator: {
      navButton: {
        borderRadius: '{border.radius.md}',
      },
    },
  },
})

export default Passport
