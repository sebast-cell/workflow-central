import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        sm: '0 1px 2px hsl(var(--shadow-color) / var(--shadow-opacity))',
        md: '0 4px 6px hsl(var(--shadow-color) / var(--shadow-opacity)), 0 1px 3px hsl(var(--shadow-color) / var(--shadow-opacity))',
        lg: '0 10px 15px hsl(var(--shadow-color) / var(--shadow-opacity)), 0 4px 6px hsl(var(--shadow-color) / var(--shadow-opacity))',
        xl: '0 20px 25px hsl(var(--shadow-color) / var(--shadow-opacity)), 0 8px 10px hsl(var(--shadow-color) / var(--shadow-opacity))',
      },
      fontFamily: {
        body: ['Inter', 'Roboto', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        status: {
          'active-bg': 'hsl(var(--status-active-bg))',
          'active-text': 'hsl(var(--status-active-text))',
          'warning-bg': 'hsl(var(--status-warning-bg))',
          'warning-text': 'hsl(var(--status-warning-text))',
          'destructive-bg': 'hsl(var(--status-destructive-bg))',
          'destructive-text': 'hsl(var(--status-destructive-text))',
        }
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
