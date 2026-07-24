const jwt = require("jsonwebtoken");
const { prisma } = require("../config/db");
const googleAuthService = require("../services/googleAuthService");

const JWT_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Initiates the Google OAuth 2.0 flow by redirecting the client to Google's consent screen.
 */
const login = (req, res) => {
  try {
    const authUrl = googleAuthService.generateAuthUrl();
    console.log("[AUTH] Redirecting user to Google OAuth screen");
    res.redirect(authUrl);
  } catch (error) {
    console.error(`[SYSTEM_ERROR] OAuth login initiation failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to initiate login flow"
    });
  }
};

/**
 * Handles the redirect callback from Google OAuth.
 */
const callback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      console.log("[AUTH_ERROR] Callback failed: No authorization code received");
      return res.status(400).json({
        success: false,
        message: "Authorization code missing"
      });
    }

    // Exchange code for tokens
    const tokens = await googleAuthService.exchangeAuthorizationCode(code);
    
    // Retrieve user details from token payload
    const profile = await googleAuthService.getGoogleProfile(tokens);
    
    let user = await prisma.user.findUnique({
      where: { googleId: profile.googleId }
    });

    if (user) {
      console.log(`[AUTH] User ${profile.email} exists, updating profile and tokens`);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: profile.name,
          picture: profile.picture,
          accessToken: tokens.access_token,
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
        }
      });
    } else {
      console.log(`[AUTH] Creating new user profile for ${profile.email}`);
      user = await prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token
        }
      });
    }

    // Generate JWT
    const jwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    console.log(`[AUTH] JWT issued successfully for user ID: ${user.id}`);

    // Set cookie parameters
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: JWT_EXPIRY * 1000
    });

    // Redirect to frontend application dashboard
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error(`[SYSTEM_ERROR] OAuth callback processing failed: ${error.message}`);
    const frontendUrl = process.env.CLIENT_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/?error=auth_failed`);
  }
};

/**
 * Returns the currently authenticated user's profile.
 */
const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: {
        id: req.user.id,
        googleId: req.user.googleId,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture
      }
    });
  } catch (error) {
    console.error(`[SYSTEM_ERROR] Failed to retrieve user profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * Logs out the user by clearing the JWT token cookie.
 */
const logout = (req, res) => {
  try {
    const userId = req.user ? req.user.id : "unknown";
    console.log(`[AUTH] Logout: clearing credentials for user ${userId}`);
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error(`[SYSTEM_ERROR] Logout processing failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: "Failed to logout"
    });
  }
};

module.exports = {
  login,
  callback,
  profile: getProfile,
  logout
};
