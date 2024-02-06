import { MongoClient, GridFSBucket } from 'mongodb'
import mongoose from 'mongoose'
require('./schema/Project')
require('./schema/Option')
require('./schema/User')

declare global {
	var client: MongoClient | null
	var bucket: GridFSBucket | null
}

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

export async function connectToDb() {
	if (global.client) {
		return {
			client: global.client,
			bucket: global.bucket!,
		}
	}

	const client = (global.client = new MongoClient(MONGODB_URI!, {}))
	const bucket = (global.bucket = new GridFSBucket(client.db(), {
		bucketName: 'projectFiles',
	}))

	try {
		await mongoose.connect(MONGODB_URI!)
		await global.client.connect()
		console.log('Connected to the Database ')
	} catch (error) {
		console.log("error connecting to the database")
		global.client = null
		return { client, bucket: bucket! }
	} finally {
		return { client, bucket: bucket! }
	}
}

export async function fileExists(filename: string): Promise<boolean> {
	const { bucket } = await connectToDb()
	const count = await bucket.find({ filename: filename })

	return !!count
}
