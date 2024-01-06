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
