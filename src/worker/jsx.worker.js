export default function Worker_fn() {
	return new Worker('http://localhost:3000/jsx.worker.js')
}
