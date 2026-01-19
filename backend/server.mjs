import express from 'express';
import path from 'path';
import fs from 'fs';
import api from './routes/api.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// Лог запросов
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

// API
app.use('/api', api);

// Пути
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const distPath = path.join(__dirname, '../frontend/dist');

console.log('distPath:', distPath);

if (fs.existsSync(distPath)) {
  console.log('dist exists:', fs.readdirSync(distPath));
} else {
  console.log('dist not found');
}

// Статика
app.use(express.static(distPath));

// Маршруты
app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) console.log('Error sending index.html:', err.message);
  });
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) console.log('Fallback error:', err.message);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
