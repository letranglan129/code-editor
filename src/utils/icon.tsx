import {
	Astro,
	Bootstrap,
	Express,
	H3,
	HTML,
	Javascript,
	Nest,
	Next,
	Node,
	Nuxt,
	React,
	Remix,
	Solid,
	Svelte,
	Typescript,
	Vue,
} from '@/icons'
import Preact from '../icons/Preact'
import NativeScript from '../icons/NativeScript'

export const getIcon = (icon: string, className = '') => {
	switch (icon) {
		case 'react':
			return <React className={`${className} mr-4 `} />
		case 'node':
			return <Node className={`${className} mr-4 `} />
		case 'nuxt':
			return <Nuxt className={`${className} mr-4 `} />
		case 'next':
			return <Next className={`${className} mr-4 `} />
		case 'nest':
			return <Nest className={`${className} mr-4 `} />
		case 'express':
			return <Express className={`${className} mr-4 fill-white`} />
		case 'h3':
			return <H3 className={`${className} mr-4 `} />
		case 'vue':
			return <Vue className={`${className} mr-4 `} />
		case 'bootstrap':
			return <Bootstrap className={`${className} mr-4 `} />
		case 'solid':
			return <Solid className={`${className} mr-4 `} />
		case 'svelte':
			return <Svelte className={`${className} mr-4 `} />
		case 'astro':
			return <Astro className={`${className} mr-4 `} />
		case 'html':
			return <HTML className={`${className} mr-4 `} />
		case 'typescript':
			return <Typescript className={`${className} mr-4 `} />
		case 'javascript':
			return <Javascript className={`${className} mr-4 `} />
		case 'remix':
			return <Remix className={`${className} mr-4 `} />
		case 'preact':
			return <Preact className={`${className} mr-4 `} />
		case 'nativescript':
			return <NativeScript className={`${className} mr-4 `} />
		default:
			return <Javascript className={`${className} mr-4 `} />
	}
}
