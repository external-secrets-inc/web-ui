const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: "true",
      padding: {
        DEFAULT: "1rem",
        lg: "3rem",
      },
      screens: {
        lg: "1376px",
      },
    },
    fontFamily: {
      sans: ["Figtree", ...fontFamily.sans],
      display: ["Libre Baskerville", ...fontFamily.serif],
      mono: ["Geist Mono", ...fontFamily.mono],
      serif: [...fontFamily.serif],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          950: "hsl(var(--primary-950))",
          1000: "hsl(var(--primary-1000))",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          50: "hsl(var(--secondary-50))",
          100: "hsl(var(--secondary-100))",
          200: "hsl(var(--secondary-200))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
          500: "hsl(var(--secondary-500))",
          600: "hsl(var(--secondary-600))",
          700: "hsl(var(--secondary-700))",
          800: "hsl(var(--secondary-800))",
          900: "hsl(var(--secondary-900))",
          950: "hsl(var(--secondary-950))",
          1000: "hsl(var(--secondary-1000))",
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        link: {
          DEFAULT: "hsl(var(--link))",
          hover: "hsl(var(--link-hover))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        base: {
          50: "hsl(var(--base-50))",
          100: "hsl(var(--base-100))",
          200: "hsl(var(--base-200))",
          300: "hsl(var(--base-300))",
          400: "hsl(var(--base-400))",
          500: "hsl(var(--base-500))",
          600: "hsl(var(--base-600))",
          700: "hsl(var(--base-700))",
          800: "hsl(var(--base-800))",
          900: "hsl(var(--base-900))",
          950: "hsl(var(--base-950))",
          1000: "hsl(var(--base-1000))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 6px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "6px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: 0,
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: 0,
          },
        },
        "bg-auth-hero-scroll": {
          from: {
            transform: "translateY(0%)",
          },
          to: {
            transform: "translateY(-50%)",
          },
        },
        "bg-auth-blob-animation-1": {
          "0%": {
            transform: "scale(8) translate(-30%, 40%) rotate(-20deg)",
          },
          "25%": {
            transform:
              "scale(8) translate(0%, 20%) skew(-15deg, -15deg) rotate(80deg)",
          },
          "50%": {
            transform: "scale(8) translate(30%, -10%) rotate(180deg)",
          },
          "75%": {
            transform:
              "scale(8) translate(-30%, 40%) skew(15deg, 15deg) rotate(240deg)",
          },
          "100%": {
            transform: "scale(8) translate(-30%, 40%) rotate(-20deg)",
          },
        },
        "bg-auth-blob-animation-2": {
          "0%": {
            transform: "scale(8) translate(20%, -40%) rotate(-20deg)",
          },
          "20%": {
            transform:
              "scale(8) translate(0%, 0%) skew(-15deg, -15deg) rotate(80deg)",
          },
          "40%": {
            transform: "scale(8) translate(-40%, 50%) rotate(180deg)",
          },
          "60%": {
            transform:
              "scale(8) translate(-20%, -20%) skew(15deg, 15deg) rotate(80deg)",
          },
          "80%": {
            transform: "scale(8) translate(10%, -30%) rotate(180deg)",
          },
          "100%": {
            transform: "scale(8) translate(20%, -40%) rotate(340deg)",
          },
        },
        "collapsible-down": {
          from: {
            height: "0",
            opacity: 0,
          },
          to: {
            height: "var(--radix-collapsible-content-height)",
            opacity: 1,
          },
        },
        "collapsible-up": {
          from: {
            height: "var(--radix-collapsible-content-height)",
            opacity: 1,
          },
          to: {
            height: "0",
            opacity: 0,
          },
        },
        "fade-in": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
        "fade-out": {
          from: {
            opacity: 1,
          },
          to: {
            opacity: 0,
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.4s ease-in-out",
        "accordion-up": "accordion-up 0.4s ease-in-out",
        "bg-auth-hero-scroll": "bg-auth-hero-scroll 200s linear infinite",
        "bg-auth-blob-animation-1":
          "bg-auth-blob-animation-1 20s infinite cubic-bezier(0.1, 0, 0.9, 1)",
        "bg-auth-blob-animation-2":
          "bg-auth-blob-animation-2 20s infinite cubic-bezier(0.1, 0, 0.9, 1)",
        "fade-in": "fade-in 0.4s ease-in-out",
        "fade-out": "fade-out 0.4s ease-in-out",
        "collapsible-down": "collapsible-down 0.15s ease-in",
        "collapsible-up": "collapsible-up 0.15s ease-in",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
