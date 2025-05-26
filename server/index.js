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
  zoom: Number,
  position: {
    x: Number,
    y: Number,
  },
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

app.delete('/api/schemes/:id', async (req, res) => {
  try {
    const result = await Scheme.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).send({ message: 'Схема не найдена' });
    }
    res.status(200).send({ message: 'Схема успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении схемы:', error);
    res.status(500).send({ message: 'Ошибка при удалении схемы' });
  }
});

// Роуты для автосохранения
app.post('/api/autosave', async (req, res) => {
  try {
    const { nodes, edges, zoom, position } = req.body;
    const autosaveData = { nodes, edges, zoom, position, name: 'autosave' };

    // Найти и обновить документ автосохранения или создать новый, если не найден
    const result = await Scheme.findOneAndUpdate(
      { name: 'autosave' },
      autosaveData,
      { upsert: true, new: true } // upsert: true creates if not found, new: true returns the updated document
    );

    res.status(200).send(result);
  } catch (error) {
    console.error('Error saving autosave:', error);
    res.status(500).send({ message: 'Error saving autosave' });
  }
});

app.get('/api/autosave', async (req, res) => {
  try {
    const autosaveData = await Scheme.findOne({ name: 'autosave' });
    if (!autosaveData) {
      return res.status(404).send({ message: 'Autosave data not found' });
    }
    res.status(200).send(autosaveData);
  } catch (error) {
    console.error('Error loading autosave:', error);
    res.status(500).send({ message: 'Error loading autosave' });
  }
});

// Запуск сервера
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});