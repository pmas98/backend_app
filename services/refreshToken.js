const admin = require("firebase-admin");
const axios = require("axios");
require("dotenv").config();

async function refreshToken(refreshToken, res) {
    const apiKey = process.env.APIKEY; // Access API key from environment variables
    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;
    const requestBody = {
        grant_type: "refresh_token",
        refresh_token: refreshToken
    };
    try {
        const response = await axios.post(url, requestBody);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = refreshToken;
