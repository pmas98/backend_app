const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Docs",
      version: "1.0.0",
      description: "API documentation for routes",
    },
  },
  apis: ["./routes/*.js"], // Specify the path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
