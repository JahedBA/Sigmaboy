const socket = io();

let username = '';

// Prompt for username when the page loads
window.onload = () => {
  const storedUsername = localStorage.getItem('username');
  if (storedUsername) {
    username = storedUsername;
    startChat();
  } else {
    document.getElementById('username-modal').style.display = 'flex';
  }
};

// Start chat after the username is entered
document.getElementById('start-chat-btn').addEventListener('click', () => {
  const usernameInput = document.getElementById('username-input').value;
  if (usernameInput.trim() !== '') {
    username = usernameInput;
    localStorage.setItem('username', username); // Store username for future sessions
    startChat();
  }
});

// Function to start chat after username is entered
function startChat() {
  document.getElementById('username-modal').style.display = 'none';
  document.getElementById('chat-container').style.display = 'flex';
}

// Send message with username
document.getElementById('send-btn').addEventListener('click', () => {
  const message = document.getElementById('message-input').value;
  if (message.trim() !== '') {
    socket.emit('chat message', { message, sender: username });
    document.getElementById('message-input').value = '';
  }
});

// Emit typing event when user types
document.getElementById('message-input').addEventListener('input', () => {
  socket.emit('typing', true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', false);
  }, 1000);
});

// Listen for incoming messages and display
socket.on('chat message', (data) => {
  const { message, sender } = data;
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(sender === username ? 'sent' : 'received');
  
  // Create a div for the sender's username
  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add('message-sender');
  usernameDiv.textContent = sender;

  // Add the username and message
  messageDiv.appendChild(usernameDiv);
  messageDiv.appendChild(document.createTextNode(message));

  document.getElementById('messages').appendChild(messageDiv);

  // Scroll to the bottom of the chat
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

// Listen for chat history when user connects
socket.on('chat history', (history) => {
  history.forEach((data) => {
    const { message, sender } = data;
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === username ? 'sent' : 'received');
    
    // Create a div for the sender's username
    const usernameDiv = document.createElement('div');
    usernameDiv.classList.add('message-sender');
    usernameDiv.textContent = sender;

    // Add the username and message
    messageDiv.appendChild(usernameDiv);
    messageDiv.appendChild(document.createTextNode(message));

    document.getElementById('messages').appendChild(messageDiv);
  });

  // Scroll to the bottom of the chat
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});

// Listen for typing indicator
socket.on('typing', (isTyping) => {
  const typingIndicator = document.getElementById('typing-indicator');
  if (isTyping) {
    typingIndicator.style.display = 'block';
  } else {
    typingIndicator.style.display = 'none';
  }
});

let typingTimeout;
