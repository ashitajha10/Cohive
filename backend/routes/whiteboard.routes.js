const router = require("express").Router();
const whiteboardController = require("../controllers/whiteboard.controller");
const auth = require("../middleware/auth.middleware");

router.get("/:roomId", auth, whiteboardController.getWhiteboardByRoom);
router.put("/:roomId", auth, whiteboardController.updateWhiteboard);

module.exports = router;
