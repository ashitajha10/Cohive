const router = require("express").Router();
const resourceController = require("../controllers/resource.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, resourceController.createResource);
router.get("/:roomId", auth, resourceController.getResourcesByRoom);
router.delete("/:id", auth, resourceController.deleteResource);

module.exports = router;
