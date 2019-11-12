const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const upload = multer({ dest: path.join(__dirname, "..", "uploads") });

const router = express.Router();

router.post("/upload", upload.array("photos"), async (req, res, next) => {
  for (const file of req.files) {
    const fileName = path.parse(file.originalname).name;
    const input = sharp(file.path).resize(1920);
    const inputClone = input.clone();
    await input.webp({ quality: 50 }).toFile(`static/photos/${fileName}.webp`);
    await inputClone
      .jpeg({ quality: 50 })
      .toFile(`static/photos/${fileName}.jpg`);
  }
  next();
});

router.all("/upload", async (req, res) => {
  res.render("pages/admin/upload.njk", { req });
});

module.exports = router;
