import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import api from './routes/api.js';
import cors from 'cors';


// Настройка __dirname (для ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// API маршруты
app.use('/api', api);

// Раздача фронтенда (из dist)
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Все остальные запросы — отдаём index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

app.use(cors());

export default app;