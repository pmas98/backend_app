const initFirebase = require("./initiateFirebase.js");
const express = require("express");
const routes = require("./routes/route.js"); // Import your routes
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerSepc.js");
initFirebase();

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

app.use("/", routes);


const PORT = process.env.PORT || 3000; // Use the PORT environment variable if available, otherwise default to 3000

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});