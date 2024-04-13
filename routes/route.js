const admin = require("firebase-admin");
const multer = require("multer");
const express = require("express");
const router = express.Router();
const createUser = require("../services/createUser.js")
const signInWithEmailAndPassword = require("../services/loginUser.js");
const refreshToken = require("../services/refreshToken.js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    createUser(email, password, res);
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    signInWithEmailAndPassword(email, password)
    .then(data => {
        return res.status(200).json(data);
    })
    .catch(error => {
        return res.status(400).json({ error: error.message });
    });
});

router.post("/refresh", async (req, res) => {
    const { refresh_token } = req.body;
    refreshToken(refresh_token, res)
    .then(data => {
        return res.status(200).json(data);
    })
    .catch(error => {
        return res.status(400).json({ error: error.message });
    });
});

router.post("/verifyToken", async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return res.status(200).json({ uid: decodedToken.uid });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.get("/expo", async (req, res) => {
    try {
        const expoCollection = admin.firestore().collection("expo");
        const snapshot = await expoCollection.get();
        const expoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(expoList);
    } catch (error) {
        console.error("Error getting objects:", error);
        return res.status(500).json({ error: "Failed to get objects." });
    }
})

router.post("/expo", async (req, res) => {
try {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name is required." });
    }

    const expoCollection = admin.firestore().collection("expo");

    await expoCollection.add({ name });

    res.status(200).json({ message: "Expo added successfully." });
    } catch (error) {
    console.error("Error adding object:", error);
    res.status(500).json({ error: "Failed to add object." });
    }
});

router.delete("/expo", async (req,res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "ID is required." });
        }

        const expoCollection = admin.firestore().collection("expo");

        await expoCollection.doc(id).delete();

        res.status(200).json({ message: "Expo deleted successfully." });
    } catch (error) {
        console.error("Error deleting object:", error);
        res.status(500).json({ error: "Failed to delete object." });
    }
})

router.get("/obra", async (req, res) => {
    try {
        const expoCollection = admin.firestore().collection("obra");
        const snapshot = await expoCollection.get();
        const expoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(expoList);
    } catch (error) {
        console.error("Error getting objects:", error);
        return res.status(500).json({ error: "Failed to get objects." });
    }
})

router.post("/obra", async (req, res) => {
    try {
        const { id, name, autor, description, imageURL } = req.body;
    
        if (!name) {
            return res.status(400).json({ error: "Name is required." });
        }
        if (!autor) {
            return res.status(400).json({ error: "Autor is required." });
        }
        if (!description) {
            return res.status(400).json({ error: "Description is required." });
        }
        if (!imageURL) {
            return res.status(400).json({ error: "ImageURL is required." });
        }
        if (!id) {
            return res.status(400).json({ error: "ID is required." });
        }
        
        const expoCollection = admin.firestore().collection("obra");
        const productToAdd = {
            name,
            autor,
            description,
            imageURL
        }

        await expoCollection.add(productToAdd);
    
        res.status(200).json({ message: "Object added successfully." });
        } catch (error) {
        console.error("Error adding object:", error);
        res.status(500).json({ error: "Failed to add object." });
        }
    });


router.patch("/obra", async (req, res) => {
    try {
        const { id, name, autor, description, imageURL } = req.body;
    
        if (!name) {
            return res.status(400).json({ error: "Name is required." });
        }
        if (!autor) {
            return res.status(400).json({ error: "Autor is required." });
        }
        if (!description) {
            return res.status(400).json({ error: "Description is required." });
        }
        if (!imageURL) {
            return res.status(400).json({ error: "ImageURL is required." });
        }
        if (!id) {
            return res.status(400).json({ error: "ID is required." });
        }
        
        const expoCollection = admin.firestore().collection("obra");
        const productToUpdate = {
            name,
            autor,
            description,
            imageURL
        }

        await expoCollection.doc(id).update(productToUpdate);
    
        res.status(200).json({ message: "Object updated successfully." });
        } catch (error) {
        console.error("Error updating object:", error);
        res.status(500).json({ error: "Failed to update object." });
        }
})

router.post("/uploadAudio", upload.single("audio"), async (req, res) => {
    try {
      const file = req.file;
  
      if (!file) {
        return res.status(400).send("No file uploaded.");
      }
  
      const bucket = admin.storage().bucket("mobileproject-505ca.appspot.com");
      const blob = bucket.file(file.originalname);
      const blobStream = blob.createWriteStream();
  
      blobStream.on("error", (error) => {
        console.error(error);
        res.status(500).send("Error uploading file.");
      });
  
      blobStream.on("finish", async () => {

        const url = await blob.getSignedUrl({
          action: "read",
          expires: "03-01-2500", 
        });
  
        res.status(200).json({ imageURL: url });
      });
  
      blobStream.end(file.buffer);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send("Error uploading file.");
    }
  });


router.delete("/obra", async (req,res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: "ID is required." });
        }

        const expoCollection = admin.firestore().collection("obra");

        await expoCollection.doc(id).delete();

        res.status(200).json({ message: "Object deleted successfully." });
    } catch (error) {
        console.error("Error deleting object:", error);
        res.status(500).json({ error: "Failed to delete object." });
    }
})

module.exports = router;