export function startConsole(target: Window, source?: string) {
	if (typeof window === 'undefined') {
		return
	}
	
	target.window.console = {
		...window.console,
		log: function (msg) {
			return target.window?.console.log(maybeStringify(msg))
		},
		warn: function (msg) {
			return target.window?.console.warn(maybeStringify(msg))
		},
		error: function (err) {
			if (err) {
				if (typeof err === 'string') {
					err = err.split(' at ')[0]
				}
				return target.window?.console.error(maybeStringify(err.message || err))
			}
		},
	}
	window.onerror = function (error) {
		return console.error(error)
	}
}

function maybeStringify(msg: string) {
	return typeof msg === 'object' ? JSON.stringify(msg) : msg
}
