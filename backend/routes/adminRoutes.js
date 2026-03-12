const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getAllUsers } = require("../controllers/adminController");

router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;