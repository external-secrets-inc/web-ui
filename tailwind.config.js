/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: 'true',
  		padding: {
  			DEFAULT: '1rem',
  			lg: '3rem'
  		},
  		screens: {
  			lg: '1376px'
  		}
  	},
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xs: 'calc(var(--radius) - 8px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: 0 },
  				to: { height: 'var(--radix-accordion-content-height)' },
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: 0 },
  			},
  			'bg-auth-hero-scroll': {
  				from: {
  					backgroundPosition: 'center center'
  				},
  				to: {
  					backgroundPosition: 'center -3000px'
  				}
  			},
  			'bg-auth-blob-animation-1': {
  				'0%': {
  					transform: 'translate(-30%, 40%) rotate(-20deg)'
  				},
  				'25%': {
  					transform: 'translate(0%, 20%) skew(-15deg, -15deg) rotate(80deg)'
  				},
  				'50%': {
  					transform: 'translate(30%, -10%) rotate(180deg)'
  				},
  				'75%': {
  					transform: 'translate(-30%, 40%) skew(15deg, 15deg) rotate(240deg)'
  				},
  				'100%': {
  					transform: 'translate(-30%, 40%) rotate(-20deg)'
  				}
  			},
  			'bg-auth-blob-animation-2': {
  				'0%': {
  					transform: 'translate(20%, -40%) rotate(-20deg)'
  				},
  				'20%': {
  					transform: 'translate(0%, 0%) skew(-15deg, -15deg) rotate(80deg)'
  				},
  				'40%': {
  					transform: 'translate(-40%, 50%) rotate(180deg)'
  				},
  				'60%': {
  					transform: 'translate(-20%, -20%) skew(15deg, 15deg) rotate(80deg)'
  				},
  				'80%': {
  					transform: 'translate(10%, -30%) rotate(180deg)'
  				},
  				'100%': {
  					transform: 'translate(20%, -40%) rotate(340deg)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  			'accordion-up': 'accordion-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  			'bg-auth-hero-scroll': 'bg-auth-hero-scroll 600s linear infinite',
  			'bg-auth-blob-animation-1': 'bg-auth-blob-animation-1 20s infinite cubic-bezier(0.1, 0, 0.9, 1)',
  			'bg-auth-blob-animation-2': 'bg-auth-blob-animation-2 20s infinite cubic-bezier(0.1, 0, 0.9, 1)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
