import { connectToDatabase } from "../db.js"

async function connectToMultiplayerCollection(){
    const client = await connectToDatabase()
    const multiplayerCollection = client.db("Historical").collection("Multiplayer")
    return multiplayerCollection
}

async function saveRoom(room) {
    try {
        console.log(room);
        const multiplayerCollection = await connectToMultiplayerCollection();
        const existingRoom = await multiplayerCollection.findOne({ code: room.code });
        if (existingRoom) {
            throw new Error(`Room with code ${room.code} already exists.`);
        }
        const result = await multiplayerCollection.insertOne(room);
        return result;
    } catch (error) {
        throw error;
    }
}

async function joinRoom(code, username) {
    try {
        const multiplayerCollection = await connectToMultiplayerCollection();
        
        const room = await multiplayerCollection.findOne({ code });

        if (!room) {
            throw new Error("Room not found with the provided code.");
        }

        const existingUser = room.users.find(user => user.username === username);
        if (existingUser) {
            throw new Error("Username already exists in the room.");
        }

        room.users.push({ username, points: 0 });

        await multiplayerCollection.updateOne({ code }, { $set: { users: room.users } });

        return room;
    } catch (error) {
        throw error;
    }
}


async function addPoints(points, code, username) {
    try {
        const multiplayerCollection = await connectToMultiplayerCollection();

        await multiplayerCollection.updateOne(
            { code, "users.username": username },
            { $inc: { "users.$.points": points } }
        );
    } catch (error) {
        throw error;
    }
}




export { saveRoom, joinRoom, addPoints };
