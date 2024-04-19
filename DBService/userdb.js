import { connectToDatabase } from "../db.js"
import { connectToDataCollection } from "./studyDatadb.js";

async function insertUser(newUser) {
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");
        const result = await usersCollection.insertOne(newUser);
        console.log("User inserted successfully:", result.insertedId);
        return result.insertedId;
    } catch (error){
        console.error("Error inserting user:", error);
        throw new Error("Failed to insert user");
    }
}

async function getUser(username) {
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");
        const user = await usersCollection.findOne({ username });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user._id,
            role: user.role,
            password: user.password
        };
    } catch (error) {
        console.error("Error finding user:", error);
        throw new Error("Failed to get user information");
    }
}

async function ifUserExists(username, email) {
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");
        const result = await usersCollection.findOne({ $or: [{ username }, { email }] });
        return !!result;
    } catch (error) {
        throw new Error("Failed to check user existence");
    }
}

async function deleteUser(_id){
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");
        const result = await usersCollection.deleteOne({ _id });
        if (result.deletedCount === 0) {
            throw new Error('User not found');
        }
        console.log("User deleted successfully");
    } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error("Failed to delete user");
    }
}

async function updateUser(oldUsername, newData) {
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");
        
        const user = await usersCollection.findOne({ username: oldUsername });
        if (!user) {
            throw new Error('User not found');
        }
        
        const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: newData }
        );

        if (result.modifiedCount === 0) {
            throw new Error('Failed to update user');
        }

        console.log("User updated successfully");
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
}

async function getLernsetLength() {
    try {
        const lernsetCollection = await connectToDataCollection();
        const maxLernsetId = await lernsetCollection.find().sort({ lernsetId: -1 }).limit(1).project({ _id: 0, lernsetId: 1 }).toArray();
        return maxLernsetId[0].lernsetId;
    } catch (error) {
        console.error("Error getting lernset length:", error);
        throw new Error("Failed to get lernset length");
    }
}

async function getProgress(username) {
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");
        
        const user = await usersCollection.findOne({ username: username });
        if (!user) {
            throw new Error("User not found");
        }

        const progress = user.progress;
        return progress;
    } catch (error) {
        console.error("Error getting user progress:", error);
        throw new Error("Failed to get user progress");
    }
}

async function updateUserProgress(username, lernsetId, changeStatus) {
    try {
        const client = await connectToDatabase();
        const usersCollection = client.db("Historical").collection("Users");

        const user = await usersCollection.findOne({ username: username });
        if (!user) {
            throw new Error("User not found");
        }

        if (!user.progress) {
            user.progress = {};
        }

        user.progress[lernsetId] = changeStatus;

        const result = await usersCollection.updateOne(
            { _id: user._id },
            { $set: { progress: user.progress } }
        );


        console.log(`User progress for lernsetId ${lernsetId} updated successfully`);
    } catch (error) {
        console.error("Error updating user progress:", error);
        throw new Error("Failed to update user progress");
    }
}






export { insertUser, getUser, ifUserExists, deleteUser, updateUser, getLernsetLength, getProgress, updateUserProgress};