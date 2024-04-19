import express from "express";
import { insertUser, ifUserExists, getUser, deleteUser, updateUser, getLernsetLength, getProgress, updateUserProgress } from "../DBService/userdb.js";
import bcrypt from 'bcrypt'

const userRouter = express.Router()

// CREATE USER

userRouter.post('/create', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if(username == ""){
            res.status(400).json({ message: "Nutzername muss gegeben sein" });
            return;
        }

        if (!email.includes("@stud.kbw.ch")) {
            res.status(400).json({ message: "Ungültige Email, vewende die KBW Email" });
            return;
        }

        const userExists = await ifUserExists(username, email);
        if (userExists) {
            res.status(400).json({ message: "Nutzer oder Email existiert bereits" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const lernsetLength = await getLernsetLength();

        const progress = {};
        for (let i = 1; i <= lernsetLength; i++) {
            progress[i.toString()] = "wrong";
        }

        const newUser = {
            username,
            email,
            password: hashedPassword,
            role: "student",
            progress
        };

        const insertedId = await insertUser(newUser);
        res.status(201).json({ message: "Registration erfolgreich", userId: insertedId });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: error.message });
    }
});

// LOGIN USER

userRouter.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body
        const user = await getUser(username);
        const passwordMatch = await bcrypt.compare(password, user.password);

        if(!passwordMatch){
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({ id: user.id, role: user.role, message: "User Confirmed!"})
    }catch(error){
        res.status(500).json({message: error.message})
    }
})

// DELETE USER

userRouter.delete('/delete/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await getUser(username);
        await deleteUser(user.id); 
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: error.message });
    }
});

// UPDATE USER
userRouter.patch('/update/:oldUsername', async (req, res) => {
    try{
        const { oldUsername } = req.params;
        const { username, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await updateUser(oldUsername, { username, password: hashedPassword });

        res.status(200).json({ message: "User updated successfully" });
    } catch(error) {
        console.error("Error updating user: ", error);
        res.status(500).json({ message: error.message });
    }
});


// GET ALL PROGRESS BY USERNAME
userRouter.get('/progress/all/:username', async (req,res) => {
    try{
        const username = req.params.username
        const progress = await getProgress(username);

        res.status(200).json(progress)
    }catch(error){
        console.error("Error get Userprogress:", error);
        res.status(500).json({ message: error.message });
    }
})

// GET SPECIFIC PROGRESS/LERNSETID
userRouter.get('/progress/specific/:username/:lernsetId', async (req,res) => {
    try{
        const { username, lernsetId } = req.params;
        const progress = await getProgress(username);

        // Assuming progress is an object where keys are lernsetIds
        const specificProgress = progress[lernsetId];

        res.status(200).json(specificProgress);
    }catch(error){
        console.error("Error getting specific user progress:", error);
        res.status(500).json({ message: error.message });
    }
});

// UPDATE PROGRESS
userRouter.patch('/progress/update/:username/:lernsetId', async (req, res) => {
    try{
        const { username, lernsetId } = req.params;
        const { changeStatus } = req.body;

        const allowedStatus = ["wrong", "inadequate", "correct"];
        if (!allowedStatus.includes(changeStatus)) {
            return res.status(400).json({ message: "Invalid progress status" });
        }

        await updateUserProgress(username, lernsetId, changeStatus);

        res.status(200).json({ message: "Progress updated successfully" });
    } catch(error) {
        console.error("Error updating user progress: ", error);
        res.status(500).json({ message: error.message });
    }
});







export default userRouter;
