const router = require("express").Router();
const upload = require("../middleware/upload");
const auth = require("../middleware/auth.middleware");

router.post("/", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

module.exports = router;
