const app = require("./src/app");
const config = require("./src/app/config");
const { connectDB } = require("./src/app/config/db");

async function main() {
  try {
    // Connect to Database
    await connectDB();

    // Start Express Server
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

main();

// Export app for Vercel serverless functions
module.exports = app;
