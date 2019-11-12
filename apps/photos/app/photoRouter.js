const express = require("express");
const fs = require("fs");
const fsP = fs.promises;
const path = require("path");

const router = express.Router();

async function getAllImages({ format = ".webp" }) {
  const files = await fsP.readdir(
    path.join(__dirname, "..", "static", "photos")
  );
  const matching = files
    .filter(f => path.parse(f).ext == format)
    .map(f => path.parse(f).name)
    .sort();
  return matching;
}

router.get("/random", async (req, res) => {
  const images = await getAllImages({ format: req.query.format || ".webp" });
  res.redirect(
    `/photos/${images[Math.floor(Math.random() * images.length)]}.webp`
  );
});

router.get('/all/json', async (req, res) => {
  const images = await getAllImages({ format: req.query.format || ".webp" });
  res.json(images.map(i => `/photos/${i}.webp`));
});

router.get("/all", async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 16;
  const start = page * perPage;
  const images = (await getAllImages({ format: req.query.format || ".webp" })).slice(start, start + perPage);
  res.render("pages/all.njk", {
    req,
    images: images,
    page: page,
    perPage: perPage
  });
});

module.exports = router;
