/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			display: ['"Chakra Petch"', 'sans-serif'],
  			body: ['Inter', 'sans-serif'],
  		},
  		fontSize: {
  			'fluid-xs': 'clamp(0.6875rem, 0.625rem + 0.25vw, 0.75rem)',
  			'fluid-sm': 'clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem)',
  			'fluid-base': 'clamp(0.875rem, 0.8rem + 0.3vw, 1rem)',
  			'fluid-lg': 'clamp(1rem, 0.9rem + 0.4vw, 1.125rem)',
  			'fluid-xl': 'clamp(1.125rem, 1rem + 0.5vw, 1.25rem)',
  			'fluid-2xl': 'clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			monza: {
  				DEFAULT: '#DA020E',
  				50: '#FFF0F0',
  				100: '#FFD6D8',
  				500: '#DA020E',
  				600: '#B80210',
  				700: '#960211',
  			},
  			electric: {
  				DEFAULT: '#0066CC',
  				400: '#3399FF',
  				500: '#0066CC',
  				600: '#0052A3',
  			},
  			stadium: {
  				950: '#0a0f1a',
  				900: '#111827',
  				850: '#18202f',
  				800: '#1e293b',
  				700: '#334155',
  				600: '#475569',
  				400: '#94a3b8',
  			},
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'ticker-slide': {
  				'0%':   { transform: 'translateX(100%)' },
  				'100%': { transform: 'translateX(-100%)' },
  			},
  			'score-flash': {
  				'0%, 100%': { opacity: '1' },
  				'50%':      { opacity: '0.6' },
  			},
  			'card-shimmer': {
  				'0%':   { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' },
  			},
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'ticker-slide': 'ticker-slide 12s linear infinite',
  			'score-flash': 'score-flash 0.6s ease-out',
  			'card-shimmer': 'card-shimmer 3s linear infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
