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
			},
			colors: {
				desc: '#9e9e9e',
				title: '#ccc',
				editor: '#15181e',
				grayNetural: '#2e3138',
				grayDark: '#26292d',
			},
			boxShadow: {
				'border-blue': 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgb(62, 134, 242) 0px 0px 0px 1px inset',
				'border-gray': 'rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, #525252 0px 0px 0px 1px inset'
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
