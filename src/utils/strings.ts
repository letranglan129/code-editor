import { Range } from 'monaco-editor'
import slugify from 'slugify'
import { IMAGE_EXTENSIONS, PADDING_SEARCH } from './constant'

export const isUrlValid = (userInput: string) => {
	const res = userInput.match(
		/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g,
	)
	if (res == null) return false

	return true
}

export const isSameOrigin = (a: string | URL, b: string | URL) => {
	const urlA = new URL(a)
	const urlB = new URL(b)
	return urlA.origin === urlB.origin
}

export const uuidv4 = () => {
	return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
		// eslint-disable-next-line no-mixed-operators
		(Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
	)
}

export const createProjectSlug = (slug: string) => {
	let initSlug: string[] | string = slug.split('-')
	initSlug.pop()
	initSlug = initSlug.join('-')

	return slugify(`${initSlug}-${Number(new Date())}`, { replacement: '-', lower: true, strict: true })
}

export const highlightTextRange = (text: string, range: Range): string[] => {
	let start = Math.max(0, range.startColumn - PADDING_SEARCH)
	let end = Math.min(text.length, range.endColumn + PADDING_SEARCH)

	let result = [
		text.substring(start, range.startColumn - 1),
		'<mark>' + text.substring(range.startColumn - 1, range.endColumn - 1) + '</mark>',
		text.substring(range.endColumn - 1, end),
	]
	return result
}

export function jsonToFile(jsonObject: any, filename: string) {
	// Chuyển đối tượng JSON thành chuỗi JSON
	const jsonString = JSON.stringify(jsonObject, null, 2)

	// Tạo một Blob từ chuỗi JSON
	const blob = new Blob([jsonString], { type: 'application/json' })

	// Tạo một File từ Blob
	const file = new File([blob], filename, { type: 'application/json' })

	return file
}

export function isMediaFile(name: string) {
	const extensionFile = name.split('.').pop()

	if (IMAGE_EXTENSIONS.find(ext => ext === extensionFile)) {
		return true
	}

	return false
}
