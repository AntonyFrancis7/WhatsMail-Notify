const express = require("express");

const router = express.Router();

const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const gmailRoutes = require("./gmailRoutes");

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/gmail", gmailRoutes);

module.exports = router;