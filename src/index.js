const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocatonMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Join user to room
  socket.on('join', ({ username, room }) => {
    socket.join(room);

    // Send welcome message to joined user
    socket.emit('message', generateMessage('Welcome!'));

    // Send to everyone else that a user joined
    socket.broadcast
      .to(room)
      .emit('message', generateMessage(`${username} has joined!`));
  });

  // Send message text to everyone when user send a message
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }
    io.emit('message', generateMessage(message));
    callback();
  });

  // Send message to everyone when user share his location
  socket.on('sendLocation', (coords, callback) => {
    io.emit(
      'locationMessage',
      generateLocatonMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  // Send message to everyone else when a user left
  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left!'));
  });
});

server.listen(port, () => {
  console.log('Server is running on port: ' + port);
});
