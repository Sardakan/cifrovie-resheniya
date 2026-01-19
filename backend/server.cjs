const express = require('express');
const path = require('path');
const fs = require('fs');

const api = require('./routes/api.js').default;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Логирование запросов
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

app.use(cors());
app.use(express.json());

// API маршруты
app.use('/api', api);

// Пути
const distPath = path.join(__dirname, '../frontend/dist');
console.log('distPath:', distPath);

if (fs.existsSync(distPath)) {
  console.log('dist folder exists');
  console.log('Files:', fs.readdirSync(distPath));
} else {
  console.log('dist not found');
}

const indexPath = path.join(distPath, 'index.html');

// Статика
app.use(express.static(distPath));

// Маршруты
app.get('/', (req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) console.log('Error:', err.message);
  });
});

app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) console.log('Fallback error:', err.message);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
