const router = require("express").Router();
const noteController = require("../controllers/note.controller");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, noteController.createNote);
router.get("/personal", auth, noteController.getUserNotes);
router.get("/single/:id", auth, noteController.getNoteById);
router.get("/:roomId", auth, noteController.getNotesByRoom);
router.put("/:id", auth, noteController.updateNote);
router.delete("/:id", auth, noteController.deleteNote);

module.exports = router;
