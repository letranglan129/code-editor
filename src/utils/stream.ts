import { GridFSBucketReadStream, GridFSBucketWriteStream } from 'mongodb'

export async function readStream(stream: GridFSBucketReadStream) {
	return new Promise((resolve, reject) => {
		let data = ''
		stream.on('data', chunk => {
			data += chunk
		})
		stream.on('error', error => {
			reject(error)
		})
		stream.on('end', () => {
			resolve(JSON.parse(data))
		})
	})
}

export async function createFile(stream: GridFSBucketWriteStream, data: any) {
	await stream.write(data)
	stream.end()
	return new Promise((resolve, reject) => {
		stream.on('finish', resolve)
		stream.on('error', reject)
	})
}
