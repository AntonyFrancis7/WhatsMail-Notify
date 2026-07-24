const oauth2Client = require("../config/googleOAuth");

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly"
];

/**
 * Generate Google login redirection URL with required scopes.
 */
const generateAuthUrl = () => {
  console.log("[AUTH] Generating OAuth URL with openid, email, profile & gmail.readonly scopes");
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES
  });
};

/**
 * Exchange incoming authorization code for token payload.
 */
const exchangeAuthorizationCode = async (code) => {
  console.log("[AUTH] Exchanging auth code for tokens");
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

/**
 * Retrieve user profile info using the exchanged parameters.
 */
const getGoogleProfile = async (tokens) => {
  console.log("[AUTH] Decoding ID token to get Google user profile");
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture
  };
};

/**
 * Refresh expired access token using stored refresh token.
 */
const refreshAccessToken = async (refreshToken) => {
  console.log("[AUTH] Refreshing expired access token using stored refresh token");
  // Use a temporary client session for thread safety
  const tempClient = new oauth2Client.constructor(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  tempClient.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await tempClient.refreshAccessToken();
  return credentials;
};

module.exports = {
  generateAuthUrl,
  exchangeAuthorizationCode,
  getGoogleProfile,
  refreshAccessToken
};
