import { connectToDatabase } from "../db.js"
import { getLernsetLength } from "./userdb.js";

async function connectToDataCollection(){
    const client = await connectToDatabase();
    const lernsetCollection = client.db("Historical").collection("StudyData");

    return lernsetCollection
}

async function getNextLernsetId() {
    const lernsetCollection = await connectToDataCollection();
    const lastElement = await lernsetCollection.find().sort({ lernsetId: -1 }).limit(1).toArray();

    if (lastElement.length === 0) {
        return 1;
    }

    return lastElement[0].lernsetId + 1;
}


async function insertElement(newElement) {
    try {
        const lernsetCollection = await connectToDataCollection();
        const lernsetId = await getNextLernsetId();
        newElement.lernsetId = lernsetId;
        const result = await lernsetCollection.insertOne(newElement);
        console.log("Element inserted successfully:", result.insertedId);
        
        await updateAllUsersProgress(lernsetId);

        return result.insertedId;
    } catch (error) {
        console.error("Error inserting element:", error);
        throw new Error("Failed to insert element");
    }
}

async function updateAllUsersProgress(newLernsetId) {
    try {
        const client = await connectToDatabase();
        const userCollection = client.db("Historical").collection("Users");

        const result = await userCollection.updateMany(
            {},
            { $set: { [`progress.${newLernsetId}`]: "wrong" } }
        );

        console.log(`Updated progress for ${result.modifiedCount} users.`);
    } catch (error) {
        console.error("Error updating progress for all users:", error);
        throw new Error("Failed to update progress for all users");
    }
}

async function deleteElement(deletedId) {
    try {
        const lernsetCollection = await connectToDataCollection();
        const result = await lernsetCollection.deleteOne({ lernsetId: Number(deletedId) });
        
        if (result.deletedCount === 0) {
            throw new Error("Element not found");
        }

        await lernsetCollection.updateMany(
            { lernsetId: { $gt: Number(deletedId) } },
            { $inc: { lernsetId: -1 } }
        );

        console.log("Element deleted successfully with deletedId:", deletedId);
        
        await updateAllUsersProgressOnDelete(deletedId);
    } catch (error) {
        console.error("Error deleting element:", error);
        throw new Error("Failed to delete element");
    }
}

async function updateAllUsersProgressOnDelete(deletedLernsetId) {
    try {
        const client = await connectToDatabase();
        const userCollection = client.db("Historical").collection("Users");

        const result = await userCollection.updateMany(
            { },
            { $unset: { [`progress.${deletedLernsetId}`]: "" } }
        );

        const lernsetLength = await getLernsetLength();
        console.log(lernsetLength)

        console.log(deletedLernsetId)

        for (let i = Number(deletedLernsetId) + 1; i <= lernsetLength + 1; i++) {
            console.log(i)
            await userCollection.updateMany(
                { },
                { $rename: { 
                    [`progress.${i}`]: `progress.${i - 1}`
                } }
            );
        }

        console.log(`Updated progress for ${result.modifiedCount} users after deleting lernsetId ${deletedLernsetId}.`);
    } catch (error) {
        console.error("Error updating progress for all users after deleting lernsetId:", error);
        throw new Error("Failed to update progress for all users after deleting lernsetId");
    }
}




async function updateElement(lernsetId, updates) {
    try {
        if (updates.hasOwnProperty('lernsetId')) {
            throw new Error("Updating lernsetId is not permitted");
        }

        const lernsetCollection = await connectToDataCollection();
        const result = await lernsetCollection.updateOne({ lernsetId }, { $set: updates });
        
        if (result.modifiedCount === 0) {
            throw new Error("Element not found or no updates applied");
        }

        console.log("Element updated successfully with lernsetId:", lernsetId);
        return { lernsetId, ...updates };
    } catch (error) {
        console.error("Error updating element:", error);
        throw new Error("Failed to update element");
    }
}


async function getElementByLernsetId(lernsetId) {
    try {
        const lernsetCollection = await connectToDataCollection();
        const element = await lernsetCollection.findOne({ lernsetId });

        return element;
    } catch (error) {
        console.error("Error retrieving element:", error);
        throw new Error("Failed to retrieve element");
    }
}

async function getElementsByLernset(lernset) {
    try {
        const lernsetCollection = await connectToDataCollection();
        const elements = await lernsetCollection.find({ lernset }).toArray();

        return elements;
    } catch (error) {
        console.error("Error retrieving elements by lernset:", error);
        throw new Error("Failed to retrieve elements by lernset");
    }
}

async function getAllElements(){
    try {
        const lernsetCollection = await connectToDataCollection();
        const allElements = await lernsetCollection.find({}).toArray();
        return allElements;
    } catch (error) {
        console.error("Error retrieving all elements:", error);
        throw new Error("Failed to retrieve all elements");
    }
}

async function getLernsetsInfo() {
    try {
        const lernsetCollection = await connectToDataCollection();
        const lernsetInfo = {};

        const lernsetNames = await lernsetCollection.distinct("lernset");

        for (const lernset of lernsetNames) {
            const elements = await lernsetCollection.find({ lernset }).toArray();

            const lernsetIds = elements.map(element => element.lernsetId);

            lernsetInfo[lernset] = lernsetIds;
        }

        const sortedLernsetInfo = Object.entries(lernsetInfo).sort(([aLernset, aIds], [bLernset, bIds]) => aIds[0] - bIds[0]);
        
        const sortedLernsetInfoObject = Object.fromEntries(sortedLernsetInfo);

        return sortedLernsetInfoObject;
    } catch (error) {
        console.error("Error retrieving lernset names:", error);
        throw new Error("Failed to retrieve lernset names");
    }
}

export { insertElement, deleteElement, updateElement, getElementByLernsetId, connectToDataCollection, getElementsByLernset, getAllElements, getLernsetsInfo }