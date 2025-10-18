/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Space Grotesk', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        // Skeiron Teal Theme Colors
        tealTheme: {
          primary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          secondary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          accent: {
            green: '#84cc16',
            yellow: '#f59e0b', 
            red: '#ef4444',
            blue: '#0d9488',
            purple: '#8b5cf6',
            orange: '#f97316',
          },
          status: {
            success: '#84cc16',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#0d9488',
            pending: '#6b7280',
          },
          ui: {
            background: '#0f172a',
            surface: '#1e293b',
            border: '#334155',
            text: {
              primary: '#ffffff',
              secondary: '#94a3b8',
              accent: '#2dd4bf',
              muted: '#64748b',
            },
            glass: {
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'rgba(255, 255, 255, 0.2)',
            }
          },
          wind: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          energy: {
            green: '#84cc16',
            yellow: '#f59e0b',
            red: '#ef4444',
            gray: '#6b7280',
          }
        },
        // Teal Theme Colors (Default)
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        accent: {
          green: '#84cc16',
          yellow: '#f59e0b', 
          red: '#ef4444',
          blue: '#0d9488',
          purple: '#8b5cf6',
          orange: '#f97316',
        },
        status: {
          success: '#84cc16',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#0d9488',
          pending: '#6b7280',
        },
        ui: {
          background: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          text: {
            primary: '#ffffff',
            secondary: '#94a3b8',
            accent: '#2dd4bf',
            muted: '#64748b',
          },
          glass: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'rgba(255, 255, 255, 0.2)',
          }
        },
        wind: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        energy: {
          green: '#84cc16',
          yellow: '#f59e0b',
          red: '#ef4444',
          gray: '#6b7280',
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 1s linear infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'wind-flow': 'wind-flow 4s ease-in-out infinite',
        'turbine-spin': 'turbine-spin 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'wind-flow': {
          '0%, 100%': { transform: 'translateX(0px) scale(1)' },
          '50%': { transform: 'translateX(20px) scale(1.1)' },
        },
        'turbine-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
} 