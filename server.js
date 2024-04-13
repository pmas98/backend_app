const initFirebase = require("./initiateFirebase.js");
const express = require("express");
const cors = require("cors"); // Import the cors middleware
const routes = require("./routes/route.js");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerSepc.js");
initFirebase();

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());

// Use the cors middleware to enable CORS
app.use(cors());

app.use("/", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
