const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Path to store chat history
const historyFilePath = path.join(__dirname, '../data/messages.json');

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle requests to the root (serve index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

// Load the message history from the JSON file
function loadMessageHistory() {
  try {
    if (fs.existsSync(historyFilePath)) {
      const rawData = fs.readFileSync(historyFilePath, 'utf8');
      if (rawData) {
        return JSON.parse(rawData); // Parse the raw data if it's not empty
      }
    }
  } catch (error) {
    console.error('Error reading history file:', error);
  }
  return []; // Return an empty array if there's an error or no data
}

// Save a new message to the history file
function saveMessageHistory(messages) {
  try {
    fs.writeFileSync(historyFilePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving history file:', error);
  }
}

// Initialize message history when server starts
let messageHistory = loadMessageHistory();

// Emit the message history when a user connects
io.on('connection', (socket) => {
  console.log('a user connected');
  // Send the chat history to the new user
  socket.emit('chat history', messageHistory);

  // Listen for new chat messages
  socket.on('chat message', (data) => {
    const { message, sender } = data;

    // Save the new message in the history
    messageHistory.push({ message, sender });
    saveMessageHistory(messageHistory); // Save the updated history to file

    // Emit the message to all users
    io.emit('chat message', data);
  });

  // Typing indicator logic
  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', isTyping);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
