import express from "express";
import Randomstring from "randomstring";
import { getElementsByLernset } from "../DBService/studyDatadb.js";
import { saveRoom, joinRoom, addPoints } from "../DBService/multiplayerdb.js";


const multiplayerRouter = express.Router()


// CREATE ROOM
multiplayerRouter.post(('/create'), async (req, res) =>{
    try{
        const { username, lernset } = req.body;

        const lernsetData = await getElementsByLernset(lernset);

        if (lernsetData.length === 0) {
            throw new Error("Lernset not found");
        }

        const code = Randomstring.generate(5);
        
        const expiresAfter = new Date();
        expiresAfter.setHours(expiresAfter.getHours() + 1);

        const room = {
            code,
            lernset,
            users:[
                {
                    username,
                    points: 0
                }
            ],
            expiresAfter
        }

        await saveRoom(room)
        

        res.status(200).json({ room, lernsetData });

    }catch(error){
        console.error("Error creating lernset:", error);
        if (error.message === "Lernset not found") {
            res.status(404).json({ message: "Lernset nicht gefunden", errorMessage: error.message });
        } else {
            res.status(500).json({ message: "Multiplayer-Raum konnte nicht erstellt werden", errorMessage: error.message });
        }
    }
})



// Join into Room
multiplayerRouter.post('/join', async (req, res) => {
    try {
        const { code, username } = req.body;

        const room = await joinRoom(code, username);
        const lernset = await getElementsByLernset(room.lernset)
        res.status(200).json({room, lernset});
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: "Beitritt fehlgeschlagen", errorMessage: error.message });
    }
});

// Add Points
multiplayerRouter.patch('/add', async (req, res) =>{
    try {
        const { points, code, username } = req.body;
        
        await addPoints(points, code, username);
        
        res.status(200).json("successfully")
    } catch (error) {
        console.error("Error joining room:", error);
        res.status(500).json({ message: "Punkte konnten nicht hinzugefügt werden", errorMessage: error.message });
    }
})

// Get Elements by Code

multiplayerRouter.get('/get/lernset/:code', )

export default multiplayerRouter;
