const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');

const port = process.env.PORT || 4001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const cpus = os.cpus().length;
const hostname = os.hostname();
const totalMemory = os.totalmem();

const sockets = [];

setInterval(() => {
  const cpuData = {
    hostname,
    cpus,
    totalMemory,
    loadAverage: os.loadavg(),
    freeMemory: os.freemem(),
    time: new Date().toUTCString()
  };

  console.info('CPU Data:', cpuData);

  sockets.forEach(s => s.broadcast.emit('updates', cpuData));
}, 10000);

io.on('connection', socket => {
  console.info('New client connected');
  sockets.push(socket);

  socket.on('disconnect', () => {
    const idx = sockets.findIndex(s => s === socket);
    if (idx > -1) {
      // sockets.splice(idx);
      console.info('Socket removed');
    }

    console.info('Client disconnected');
  });
});

server.listen(port, () => console.info(`Listening on port ${port}`));
