import express from "express"
import { insertElement, deleteElement, updateElement, getElementByLernsetId, getElementsByLernset, getAllElements, getLernsetsInfo } from "../DBService/studyDatadb.js";

const studyDataRouter = express.Router()



// CREATE ELEMENT
studyDataRouter.post('/create', async (req, res) => {
    try {
        const { lernsetId, year, definition, description, wrongAnswers, lernset} = req.body

        
        const element = {
            lernsetId,
            year,
            definition,
            description,
            lernset,
            wrongAnswers
        }

        const insertedId = await insertElement(element);
        res.status(201).json({ message: "Element created successfully", elementId: insertedId });  
    } catch (error) {
        console.error("Error creating lernset:", error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE ELEMENT BY "lernset-id"
studyDataRouter.delete("/delete/:lernsetId", async (req, res) => {
    try {
        const lernsetId = req.params.lernsetId;
        const result = await deleteElement(lernsetId);
        res.status(200).json({ message: "Element deleted successfully" });
    } catch (error) {
        console.error("Error deleting element:", error);
        res.status(500).json({ message: error.message });
    }
});

// CHANGE ELEMENT
studyDataRouter.patch('/update/:lernsetId', async (req, res) => {
    try {
        const lernsetId = parseInt(req.params.lernsetId);
        const updates = req.body;
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No updates provided" });
        }

        const updatedElement = await updateElement(lernsetId, updates);
        res.status(200).json({ message: "Element updated successfully", updatedElement });
    } catch (error) {
        console.error("Error updating element:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET ELEMENT BY ID
studyDataRouter.get("/get/:lernsetId", async (req, res) => {
    try {
        const lernsetId = parseInt(req.params.lernsetId);
        const element = await getElementByLernsetId(lernsetId);

        if (!element) {
            return res.status(404).json({ message: "Element not found" });
        }

        res.status(200).json({ element });
    } catch (error) {
        console.error("Error retrieving element:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET ALL LERNSETS AND THEIR IDs
studyDataRouter.get("/getLernsets", async (req, res) => {
    try {
        const lernsets = await getLernsetsInfo();

        if (lernsets.length === 0) {
            return res.status(404).json({ message: "No lernsets found" });
        }

        res.status(200).json(lernsets);
    } catch (error) {
        console.error("Error retrieving lernsets:", error);
        res.status(500).json({ message: error.message });
    }
});

// GET ELEMENTS BY "lernset"
studyDataRouter.get("/get/lernset/:lernset", async (req, res) => {
    try {
        const lernset = req.params.lernset;
        
        const elements = await getElementsByLernset(lernset)

        if (elements.length === 0) {
            return res.status(404).json({ message: "No elements found for the specified lernset" });
        }

        res.status(200).json({ elements });
    } catch (error) {
        console.error("Error retrieving elements by lernset:", error);
        res.status(500).json({ message: error.message });
    }
});


// GET ALL ELEMENTS
studyDataRouter.get("/getAll", async (req, res) => {
    try {
        const allElements = await getAllElements();

        res.status(200).json({ elements: allElements });
    } catch (error) {
        console.error("Error retrieving all elements:", error);
        res.status(500).json({ message: error.message });
    }
});



export default studyDataRouter;