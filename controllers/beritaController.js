const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Berita = require('../models/beritaModel');
const Kategori = require('../models/kategoriModel');
const handlerFactory = require('./handlerFactory');
require('dotenv').config();

const serviceAccount = JSON.parse(process.env.serviceAccountKey);

const storage = new Storage({
  projectId: 'project-polda',
  credentials: serviceAccount,
});

const bucketName = 'bucket-polda';

const upload = multer({
  storage: multer.memoryStorage(),
});

exports.uploadBeritaPhoto = upload.single('photo_url');

exports.getAllBerita = catchAsync(async (req, res, next) => {
  const berita = await Berita.findAll({
    include: [Kategori],
  });

  res.status(200).json({
    status: 'success',
    results: berita.length,
    data: berita,
  });
});

exports.createBerita = catchAsync(async (req, res, next) => {
  const { title, description, kategori } = req.body;
  const { file } = req;

  // Generate a unique filename for the uploaded file
  const filename = `${uuidv4()}${path.extname(file.originalname)}`;

  // Upload the file to Google Cloud Storage
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(filename);
  const stream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
    },
  });
  stream.on('error', (err) => {
    next(new AppError(err.message, 400));
  });
  stream.on('finish', async () => {
    // Construct the URL for the uploaded file
    const url = `https://storage.googleapis.com/${bucketName}/${filename}`;

    let kategoriObj = await Kategori.findOne({ where: { name: kategori } });

    // If the kategori does not exist, create a new one
    if (!kategoriObj) {
      kategoriObj = await Kategori.create({ name: kategori });
    }

    const berita = await Berita.create({
      title,
      description,
      photo_url: url,
      kategori_id: kategoriObj.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        berita,
      },
    });
  });
  stream.end(file.buffer);
});

exports.updateBerita = catchAsync(async (req, res, next) => {
  const { title, description, kategori } = req.body;
  const { file } = req;

  // Find the berita record by ID
  const berita = await Berita.findByPk(req.params.id);

  if (!berita) {
    return next(new AppError('No document found with that ID', 404));
  }

  // Update the berita record with the new data
  if (title) berita.title = title;
  if (description) berita.description = description;
  if (kategori) {
    // Get the Kategori object based on the kategori name
    let kategoriObj = await Kategori.findOne({ where: { name: kategori } });

    // If the kategori does not exist, create a new one
    if (!kategoriObj) {
      kategoriObj = await Kategori.create({ name: kategori });
    }

    // Update the berita record with the kategori_id field
    berita.kategori_id = kategoriObj.id;
  }
  if (file) {
    // Generate a unique filename for the uploaded file
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;

    // Upload the file to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filename);
    const stream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
      },
    });
    stream.on('error', (err) => {
      next(new AppError(err.message, 400));
    });
    stream.on('finish', async () => {
      // Construct the URL for the uploaded file
      const url = `https://storage.googleapis.com/${bucketName}/${filename}`;

      // Update the kegiatan record with the uploaded file URL
      berita.photo_url = url;
      await berita.save();
    });
    stream.end(file.buffer);
  }

  await berita.save();

  res.status(200).json({
    status: 'success',
    data: berita,
  });
});

exports.getBerita = catchAsync(async (req, res, next) => {
  const berita = await Berita.findByPk(req.params.id, {
    include: [Kategori],
  });

  if (!berita) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: berita,
  });
});

exports.deleteAssociatedFile = catchAsync(async (req, res, next) => {
  const berita = await Berita.findByPk(req.params.id);

  const filename = berita.photo_url.split('/').pop();

  console.log(filename);

  if (!berita) {
    return res.status(404).json({
      status: 'fail',
      message: 'berita not found',
    });
  }

  // Delete the associated file from Google Cloud Storage
  const file = storage.bucket('bucket-polda').file(filename);
  await file.delete();
  next();
});

exports.deleteBerita = handlerFactory.deleteOne(Berita);
