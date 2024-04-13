const admin = require("firebase-admin");

async function createUser(email, password, res) {
    try {    
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            emailVerified: false 
        });

        res.status(201).json({ message: "User created successfully", uid: userRecord.uid });
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
      }
}

module.exports = createUser;
