const initFirebase = require("./initiateFirebase.js");
const createUser = require("./createUser.js")
const signInWithEmailAndPassword = require("./loginUser.js");
const refreshToken = require("./refreshToken.js");
const express = require("express");
const admin = require("firebase-admin");

initFirebase();

const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    createUser(email, password, res);
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    signInWithEmailAndPassword(email, password)
    .then(data => {
        return res.status(200).json(data);
    })
    .catch(error => {
        return res.status(400).json({ error: error.message });
    });
});

app.post("/refresh", async (req, res) => {
    const { refresh_token } = req.body;
    refreshToken(refresh_token, res)
    .then(data => {
        return res.status(200).json(data);
    })
    .catch(error => {
        return res.status(400).json({ error: error.message });
    });
});

app.post("/verifyToken", async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return res.status(200).json({ uid: decodedToken.uid });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});
// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});