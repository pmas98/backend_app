const admin = require("firebase-admin");
const multer = require("multer");
const express = require("express");
const router = express.Router();
const createUser = require("../services/createUser.js")
const signInWithEmailAndPassword = require("../services/loginUser.js");
const refreshToken = require("../services/refreshToken.js");
const qr = require('qrcode');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint to create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User created successfully
 *       '400':
 *         description: Error creating user
 */
router.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    createUser(email, password, res);
});


/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Endpoint to authenticate a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *     responses:
 *       '200':
 *         description: User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Authentication token for the user.
 *       '400':
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Refresh authentication token
 *     description: Endpoint to refresh the authentication token using a refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token.
 *     responses:
 *       '200':
 *         description: Token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New authentication token.
 *       '400':
 *         description: Invalid refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /verifyToken:
 *   post:
 *     summary: Verify authentication token
 *     description: Endpoint to verify the authenticity of an authentication token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: The authentication token to verify.
 *     responses:
 *       '200':
 *         description: Token verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uid:
 *                   type: string
 *                   description: User ID extracted from the verified token.
 *       '400':
 *         description: Invalid authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
router.post("/verifyToken", async (req, res) => {
    const { idToken } = req.body;

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return res.status(200).json({ uid: decodedToken.uid });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

/**
 * @swagger
 * /expo:
 *   get:
 *     summary: Get all expo objects
 *     description: Endpoint to retrieve all expo objects.
 *     responses:
 *       '200':
 *         description: Successful operation.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the expo object.
 *                   ... (other properties)
 *       '500':
 *         description: Failed to get expo objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /expo:
 *   post:
 *     summary: Add a new expo object
 *     description: Endpoint to add a new expo object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the expo object.
 *     responses:
 *       '200':
 *         description: Expo added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the expo object was added successfully.
 *       '400':
 *         description: Missing required field or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Failed to add expo object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /expo:
 *   delete:
 *     summary: Delete an expo object
 *     description: Endpoint to delete an expo object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the expo object to delete.
 *     responses:
 *       '200':
 *         description: Expo deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the expo object was deleted successfully.
 *       '400':
 *         description: Missing required field or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Failed to delete expo object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /obra:
 *   get:
 *     summary: Get an obra by ID
 *     description: Retrieve an obra from the Firestore collection based on the provided ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the obra to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response. Returns the requested obra.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Obra'
 *       '400':
 *         description: Bad request - ID is missing.
 *       '404':
 *         description: Obra not found.
 *       '500':
 *         description: Internal Server Error - Failed to get obra.
 */
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


/**
 * @swagger
 * /obra?id:
 *   get:
 *     summary: Get an obra by ID
 *     description: Retrieve an obra from the Firestore collection based on the provided ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the obra to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Successful response. Returns the requested obra.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Obra'
 *       '400':
 *         description: Bad request - ID is missing.
 *       '404':
 *         description: Obra not found.
 *       '500':
 *         description: Internal Server Error - Failed to get obra.
 */
router.get("/obra", async (req, res) => {
    try {
        const id = req.query.id; // Retrieve the ID from the query parameter
        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }

        const obraDoc = await admin.firestore().collection("obra").doc(id).get();
        if (!obraDoc.exists) {
            return res.status(404).json({ error: "Obra not found" });
        }

        const obraData = obraDoc.data();
        return res.status(200).json({ id: obraDoc.id, ...obraData });
    } catch (error) {
        console.error("Error getting obra:", error);
        return res.status(500).json({ error: "Failed to get obra." });
    }
});

/**
 * @swagger
 * /obra:
 *   post:
 *     summary: Add a new obra object
 *     description: Endpoint to add a new obra object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the obra object.
 *               name:
 *                 type: string
 *                 description: The name of the obra object.
 *               autor:
 *                 type: string
 *                 description: The autor of the obra object.
 *               description:
 *                 type: string
 *                 description: The description of the obra object.
 *               imageURL:
 *                 type: string
 *                 description: The imageURL of the obra object.
 *     responses:
 *       '200':
 *         description: Object added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the obra object was added successfully.
 *       '400':
 *         description: Missing required field or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Failed to add obra object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /obra:
 *   patch:
 *     summary: Update an existing obra object
 *     description: Endpoint to update an existing obra object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the obra object to update.
 *               name:
 *                 type: string
 *                 description: The updated name of the obra object.
 *               autor:
 *                 type: string
 *                 description: The updated autor of the obra object.
 *               description:
 *                 type: string
 *                 description: The updated description of the obra object.
 *               imageURL:
 *                 type: string
 *                 description: The updated imageURL of the obra object.
 *     responses:
 *       '200':
 *         description: Object updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the obra object was updated successfully.
 *       '400':
 *         description: Missing required field or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Failed to update obra object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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
/**
 * @swagger
 * /uploadAudio:
 *   post:
 *     summary: Upload an audio file
 *     description: Endpoint to upload an audio file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Audio file uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageURL:
 *                   type: string
 *                   description: URL of the uploaded audio file.
 *       '400':
 *         description: No file uploaded or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Error uploading audio file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /obra:
 *   delete:
 *     summary: Delete an obra object
 *     description: Endpoint to delete an obra object.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The ID of the obra object to delete.
 *     responses:
 *       '200':
 *         description: Object deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message indicating the obra object was deleted successfully.
 *       '400':
 *         description: Missing required field or invalid data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 *       '500':
 *         description: Failed to delete obra object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message indicating the reason for the failure.
 */
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

/**
 * @swagger
 * /qrcode:
 *   get:
 *     summary: Generate QR code
 *     description: Generate a QR code based on the provided ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID to be encoded in the QR code.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: QR code generated successfully.
 *       '400':
 *         description: Bad request - ID is missing.
 *       '500':
 *         description: Internal Server Error - Failed to generate QR code.
 */
router.get("/qrcode", async (req, res) => {
    try {
        const id = req.query.id; // Retrieve the ID from the query parameter
        if (!id) {
          return res.status(400).json({ error: "ID is required" });
        }
    
        const jsonData = {
            id: id,
          };
          const jsonString = JSON.stringify(jsonData);

          // Options for QR code generation
          const options = {
            errorCorrectionLevel: 'H', // Higher error correction level
            type: 'png', // Output type (png, svg, etc.)
            quality: 5, // Image quality factor
            margin: 1, // White space around the QR code
          };
        
          // Generate the QR code
          qr.toFileStream(res, jsonString, options, (err) => {
            if (err) {
              console.error('Error generating QR code:', err);
              res.status(500).send('Internal Server Error');
            } else {
                console.log('QR code generated successfully!');
                res.sendFile(jsonString);            }
          });
    } catch (error) {
        console.error("Error getting objects:", error);
        return res.status(500).json({ error: "Failed to get objects." });
    }
})

module.exports = router;