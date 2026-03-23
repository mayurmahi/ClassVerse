const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  getStats,
  getAllUsers,
  removeUser,
  getAllOrganizations,
  addOrganization,
  deleteOrganization,
} = require("../controllers/adminController");

router.get("/stats", auth, getStats);
router.get("/users", auth, getAllUsers);
router.delete("/users/:id", auth, removeUser);
router.get("/organizations", auth, getAllOrganizations);
router.post("/organizations", auth, addOrganization);
router.delete("/organizations/:id", auth, deleteOrganization);

module.exports = router;