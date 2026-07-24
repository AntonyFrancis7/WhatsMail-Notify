require("dotenv").config();
const { validateEnv } = require("./config/env");
const { connectDB } = require("./config/db");

// Validate required environment variables first
validateEnv();

const app = require("./app");
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Database connection must succeed first
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ [SERVER] Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

startServer();