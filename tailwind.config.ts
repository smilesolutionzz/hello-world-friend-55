import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['"Pretendard Variable"', 'Pretendard', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
				korean: ['"Pretendard Variable"', 'Pretendard', 'sans-serif'],
				pretendard: ['"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
				display: ['"Space Grotesk"', '"Pretendard Variable"', 'Pretendard', 'system-ui', 'sans-serif'],
				serif: ['"Instrument Serif"', 'Georgia', 'serif'],
			},
			fontSize: {
				'giant': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '900' }],
				'huge': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '800' }],
				'large': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
				'big': ['1.875rem', { lineHeight: '1.35', fontWeight: '600' }],
				'medium': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
				'normal': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }],
				'small': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
				'tiny': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],
				'micro': ['0.75rem', { lineHeight: '1.3', fontWeight: '300' }],
			},
			fontWeight: {
				'ultra': '900',
				'heavy': '800',
				'bold': '700',
				'semibold': '600',
				'medium': '500',
				'normal': '400',
				'light': '300',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
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
				// Custom brand colors
				'calm-blue': 'hsl(var(--calm-blue))',
				'warm-lavender': 'hsl(var(--warm-lavender))',
				'soft-mint': 'hsl(var(--soft-mint))',
				'gentle-peach': 'hsl(var(--gentle-peach))',
				
				// Visual Weight Color System
				'weight': {
					'heavy': 'hsl(var(--weight-heavy))',
					'bold': 'hsl(var(--weight-bold))',
					'medium': 'hsl(var(--weight-medium))',
					'light': 'hsl(var(--weight-light))',
					'subtle': 'hsl(var(--weight-subtle))',
				},
				
				// Primary System with Visual Weight
				'primary-strong': 'hsl(var(--primary-strong))',
				'primary-medium': 'hsl(var(--primary-medium))',
				'primary-light': 'hsl(var(--primary-light))',
				'primary-subtle': 'hsl(var(--primary-subtle))',
			},
			spacing: {
				'micro': 'var(--space-micro)',
				'tiny': 'var(--space-tiny)',
				'xs': 'var(--space-xs)',
				'sm': 'var(--space-sm)',
				'md': 'var(--space-md)',
				'lg': 'var(--space-lg)',
				'xl': 'var(--space-xl)',
				'2xl': 'var(--space-2xl)',
				'3xl': 'var(--space-3xl)',
				'4xl': 'var(--space-4xl)',
				'5xl': 'var(--space-5xl)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'visual-primary': 'calc(var(--radius) * 1.5)',
				'visual-secondary': 'var(--radius)',
				'visual-tertiary': 'calc(var(--radius) * 0.75)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'glow': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
					}
				},
				'visual-emphasis': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.9'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'balance-flow': {
					'0%, 100%': {
						transform: 'translateX(0px) rotate(0deg)'
					},
					'33%': {
						transform: 'translateX(10px) rotate(1deg)'
					},
					'66%': {
						transform: 'translateX(-5px) rotate(-0.5deg)'
					}
				},
				'slide-up': {
					'0%': {
						transform: 'translateY(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite alternate',
				'visual-emphasis': 'visual-emphasis 3s ease-in-out infinite',
				'balance-flow': 'balance-flow 6s ease-in-out infinite',
				'slide-up': 'slide-up 0.4s ease-out',
			},
			transitionTimingFunction: {
				'gentle': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'dramatic': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			},
			backdropBlur: {
				'xs': '2px',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/line-clamp")],
} satisfies Config;
