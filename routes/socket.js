// routes/chat.js
const socketio = require('socket.io');

module.exports = function (server) {
  const io = socketio(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle incoming messages
    socket.on('chat message', (msg) => {
      // Broadcast the message to all connected clients
      io.emit('chat message', msg);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
};
