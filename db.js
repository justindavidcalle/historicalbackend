// db.js

import { MongoClient, ServerApiVersion } from 'mongodb';
import { config } from 'dotenv';

config()

const uri = "mongodb+srv://IDPAGroup:FnpfU3OdJVUcjrTs@historical.rwp4hls.mongodb.net/"
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
        await client.connect()
        console.log("Connected to MongoDB!")
        return client
    } catch (error) {
        console.error("Error connecting to MongoDB:", error)
        throw error
    }
}

export { connectToDatabase };
