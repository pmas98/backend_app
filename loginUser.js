const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

async function signInWithEmailAndPassword(email, password) {
    try {
        const apiKey = process.env.APIKEY; // Access API key from environment variables

        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
        
        const requestBody = {
            email: email,
            password: password,
            returnSecureToken: true
        };

        const response = await axios.post(url, requestBody);

        return response.data; // Return the response data if needed
    } catch (error) {
        // Handle errors
        console.error('Error:', error.response.data.error.message);
        throw error; // Rethrow the error if needed
    }
}

module.exports = signInWithEmailAndPassword;
