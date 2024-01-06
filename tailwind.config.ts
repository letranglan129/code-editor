import type { Config } from 'tailwindcss'

const config: Config = {
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			backgroundColor: {
				editor: '#15181e',
			},
			colors: {
				desc: '#9e9e9e',
				title: '#ccc',
			},
			fontSize: {
				'10': '10px',
				'11': '11px',
				'12': '12px',
				'13': '13px',
				'14': '14px',
				'15': '15px',
				'16': '16px',
			},
		},
	},
	plugins: [],
}
export default config
