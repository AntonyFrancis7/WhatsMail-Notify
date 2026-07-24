const express = require("express");

const router = express.Router();

const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const gmailRoutes = require("./gmailRoutes");
const processorRoutes = require("./processorRoutes");
const preferenceRoutes = require("./preferenceRoutes");

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/gmail", gmailRoutes);
router.use("/processor", processorRoutes);
router.use("/preferences", preferenceRoutes);

module.exports = router;