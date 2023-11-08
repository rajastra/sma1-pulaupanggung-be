const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const Kategori = require('./kategoriModel');

const Berita = sequelize.define(
  'Berita',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    photo_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: false }
);

// create payload for berita
/*
{
  "title": "Berita 1",
  "description": "Deskripsi berita 1",
  "photo_url": "https://storage.googleapis.com/bucket-polda/0f5b3c4b-5f6a-4d1e-8b2a-0d3b4e6d6e1c.jpg",
  "kategori": "Kriminal"
}

*/

Kategori.hasMany(Berita, { foreignKey: 'kategori_id' });
Berita.belongsTo(Kategori, { foreignKey: 'kategori_id' });

module.exports = Berita;
