const express = require('express');
const beritaController = require('../controllers/beritaController');

const router = express.Router();

router
  .route('/')
  .get(beritaController.getAllBerita)
  .post(beritaController.uploadBeritaPhoto, beritaController.createBerita);

router
  .route('/:id')
  .get(beritaController.getBerita)
  .patch(beritaController.uploadBeritaPhoto, beritaController.updateBerita)
  .delete(beritaController.deleteBerita);

module.exports = router;
