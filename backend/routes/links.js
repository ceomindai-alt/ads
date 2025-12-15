const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const controller = require("../controllers/linksController");

// CREATE SHORT LINK
router.post("/create", auth, controller.createLink);

// USER LINKS
router.get("/my", auth, controller.listLinks);

// DELETE
router.delete("/:id", auth, controller.deleteLink);

module.exports = router;
