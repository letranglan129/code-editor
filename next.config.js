/** @type {import('next').NextConfig} */
const path = require('path')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const webcontainerHeaderConfig = [
	{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
	{ key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
	{ key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
	{ key: 'Access-Control-Allow-Origin', value: '*' },
]

const nextConfig = {
	reactStrictMode: false,
	sassOptions: {
		includePaths: [path.join(__dirname, 'styles')],
	},
	webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
		if (!isServer) {
			config.plugins.push(
				new MonacoWebpackPlugin({
					languages: ['javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'scss', 'xml', 'yaml'],
					filename: 'static/[name].worker.js',
				}),
			)

			config.resolve = {
				...(!!config?.resolve ? { ...config.resolve } : {}),
				alias: {
					inferno:
						process.env.NODE_ENV !== 'production'
							? 'inferno/dist/index.dev.esm.js'
							: 'inferno/dist/index.esm.js',
				},
				mainFields: ['browser', 'dev:module', 'module', 'main'],
			}
		}
		return config
	},
	async headers() {
		// return []
		return [
			{
				source: '/projects/:path*',
				headers: webcontainerHeaderConfig,
			},
			{
				source: '/_next/static/:path*',
				headers: webcontainerHeaderConfig,
			},
			{
				source: '/jsx.worker.js',
				headers: webcontainerHeaderConfig,
			},
		]
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
				port: '',
				pathname: '**',
			},
		],
	},
	experimental: {
		serverActions: {
			bodySizeLimit: '1024mb',
		},
	},
}

module.exports = nextConfig
