const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const fsP = fs.promises;
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

const router = express.Router();

router.post('/upload', upload.array('photos'), async (req, res, next) => {
  for (const file of req.files) {
    const fileName = req.body.tag + '__' + path.parse(file.originalname).name;
    const input = sharp(file.path)
      .resize(1920)
      .composite([
        {
          input: path.join(__dirname, '../static/res/img/image_overlay.png'),
          gravity: 'southeast'
        }
      ]);
    const inputClone = input.clone();
    await input.webp({ quality: 50 }).toFile(`static/photos/${fileName}.webp`);
    await inputClone
      .jpeg({ quality: 50 })
      .toFile(`static/photos/${fileName}.jpg`);
    await fsP.unlink(file.path);
  }
  next();
});

router.all('/upload', upload.array('photos'), async (req, res) => {
  res.render('pages/admin/upload.njk', { req });
});

router.get('/clean/:tag', upload.array('photos'), async (req, res) => {
  if (req.params.tag == 'delete_all') {
    const images = (
      await fsP.readdir(path.join(__dirname, '..', 'static', 'photos'))
    ).filter(f => f != '.gitkeep');
    for (const file of images) {
      await fsP.unlink(path.join(__dirname, '..', 'static', 'photos', file));
    }
    const uploads = (
      await fsP.readdir(path.join(__dirname, '..', 'uploads'))
    ).filter(f => f != '.gitkeep');
    for (const file of uploads) {
      await fsP.unlink(path.join(__dirname, '..', 'uploads', file));
    }
  } else {
    const images = (
      await fsP.readdir(path.join(__dirname, '..', 'static', 'photos'))
    )
      .filter(f => f != '.gitkeep')
      .filter(f => f.startsWith(req.params.tag + '__'));
    for (const file of images) {
      await fsP.unlink(path.join(__dirname, '..', 'static', 'photos', file));
    }
  }
  res.redirect('/all');
});

router.get('/clean', upload.array('photos'), async (req, res) => {
  const images = (
    await fsP.readdir(path.join(__dirname, '..', 'static', 'photos'))
  ).filter(f => f != '.gitkeep');
  const tags = Array.from(new Set(images.map(i => i.split('__')[0])));
  res.render('pages/admin/clean.njk', { req, tags });
});
module.exports = router;
