require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Простая модель
const Scheme = mongoose.model('Scheme', new mongoose.Schema({
  name: String,
  nodes: Array,
  edges: Array,
  createdAt: { type: Date, default: Date.now }
}));

// Middleware
app.use(cors());
app.use(express.json());

// Роуты
app.post('/api/schemes', async (req, res) => {
  const scheme = new Scheme(req.body);
  await scheme.save();
  res.status(201).send(scheme);
});

app.get('/api/schemes', async (req, res) => {
  const schemes = await Scheme.find();
  res.send(schemes);
});

// Запуск сервера
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});