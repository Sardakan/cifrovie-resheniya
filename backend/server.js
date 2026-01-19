import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './routes/api.js';
import cors from 'cors';
import fs from 'fs';


// Настройка __dirname (для ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api', api);

// Раздача фронтенда (из dist)
const distPath = path.join(__dirname, '../frontend/dist');
console.log('🔍 distPath:', distPath);

// Проверка: существует ли папка
if (fs.existsSync(distPath)) {
  console.log('dist folder exists');
  const files = fs.readdirSync(distPath);
  console.log('Files in dist:', files);
} else {
  console.log('dist folder NOT found at:', distPath);
}

// Проверка: есть ли index.html
const indexPath = path.join(distPath, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('index.html found at:', indexPath);
} else {
  console.log('index.html NOT found at:', indexPath);
}

// Лог всех запросов
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path);
  next();
});
app.use(express.static(distPath));

// Все остальные запросы — отдаём index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});

export default app;