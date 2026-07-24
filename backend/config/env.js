const requiredEnvVars = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "JWT_SECRET"
];

const validateEnv = () => {
  const missingVars = [];

  requiredEnvVars.forEach((variable) => {
    if (!process.env[variable]) {
      missingVars.push(variable);
    }
  });

  if (missingVars.length > 0) {
    console.error("❌ [ENV_ERROR] Missing required environment variables:");
    missingVars.forEach((variable) => {
      console.error(`   - ${variable}`);
    });
    console.error("❌ [ENV_ERROR] Server startup aborted.");
    process.exit(1);
  }

  console.log("✔ [ENV] Required environment variables verified successfully.");
};

module.exports = { validateEnv };
