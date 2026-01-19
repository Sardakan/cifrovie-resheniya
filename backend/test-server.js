const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log('Incoming:', req.method, req.url);

  // Ответ на любой запрос
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <h1>Сервер работает!</h1>
    <p>Путь: ${req.url}</p>
    <p>Порт: ${PORT}</p>
    <small>Если ты это видишь — Express тоже должен работать.</small>
  `);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Тестовый сервер запущен на http://0.0.0.0:${PORT}`);
});

// Лог каждые 30 секунд — чтобы видеть, что процесс жив
setInterval(() => {
  console.log('Сервер всё ещё работает...');
}, 30000);
