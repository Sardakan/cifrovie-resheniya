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

// Пути к фронтенду
const distPath = path.join(__dirname, '../frontend/dist');
const indexPath = path.join(distPath, 'index.html');

// Проверка существования dist (для уверенности)
if (!fs.existsSync(distPath)) {
  console.error('dist folder not found:', distPath);
  process.exit(1);
}

// Раздача фронтенда
app.use(express.static(distPath));

// Все остальные маршруты — отдаём index.html (для SPA)
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on port ${PORT}`);
});

export default app;