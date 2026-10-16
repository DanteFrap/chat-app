import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Hola mundo');
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get("username",);
  const payload = { "type": "system", "text":  `${username} joined` }
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
    }
  });
  socket.on("message", (message) => {
    wss.username = username;
    wss.clients.forEach((client) => {
      const data = JSON.parse(message);
      const { username, text } = data;
      if (client.readyState === WebSocket.OPEN) {
        const msg = { type: 'chat', username, text }
        client.send(JSON.stringify(msg));
      }
    });
  });
  socket.on("close", () => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const msg = { type: 'system', text: `${wss.username} left` }
            client.send(JSON.stringify(msg));
        }
    });

  });
});





server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
