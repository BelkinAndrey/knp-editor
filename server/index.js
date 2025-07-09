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

// Базовая схема для общих полей
const BaseSchema = new mongoose.Schema({
  nodes: Array,
  edges: Array,
  zoom: Number,
  position: Array,
  isPanelCollapsed: Boolean,
  panelWidth: Number,
  globalParams: Array,
  flowHistoryStack: Array,
});

// Модель для схем
const Scheme = mongoose.model('Scheme', new mongoose.Schema({
  name: String,
  ...BaseSchema.obj, // Включаем поля из BaseSchema
  createdAt: { type: Date, default: Date.now }
}));

const SchemaAutoSave = mongoose.model('autosave', BaseSchema);

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

app.post('/api/autosave', async (req, res) => {
  try {
    const autoSaveData = req.body;
    // Находим и обновляем (или создаем, если не существует) единственный документ автосохранения
    const result = await SchemaAutoSave.findOneAndUpdate({}, autoSaveData, { upsert: true, new: true });
    res.status(200).send(result);
  } catch (error) {
    console.error('Ошибка при автосохранении схемы:', error);
    res.status(500).send({ message: 'Ошибка при автосохранении схемы' });
  }
});

app.get('/api/autosave', async (req, res) => {
  try {
    // Находим единственный документ автосохранения
    const autoSaveData = await SchemaAutoSave.findOne({});
    if (!autoSaveData) {
      // Если документ не найден (первое сохранение)
      return res.status(404).send({ message: 'Данные автосохранения не найдены' });
    }
    res.status(200).send(autoSaveData);
  } catch (error) {
    console.error('Ошибка при получении данных автосохранения:', error);
    res.status(500).send({ message: 'Ошибка при получении данных автосохранения' });
  }
});

// Запуск сервера
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});