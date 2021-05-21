const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "yeeee" });
});

module.exports = router;
