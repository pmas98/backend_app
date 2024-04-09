const admin = require("firebase-admin");
require("dotenv").config();

function initFirebase() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SETTINGS);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = initFirebase;
