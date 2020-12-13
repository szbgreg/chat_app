const socket = io();

// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormBtn = messageForm.querySelector('button');
const sendLocationBtn = document.querySelector('#sendLocation');
const messages = document.querySelector('#messages');
const chatSidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const usersListTemplate = document.querySelector('#usersList-template')
  .innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  // Get new message element
  const newMessage = messages.lastElementChild;

  // Get the height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Total height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

// Show message if we get 'message' event from server!
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    user: message.user,
    message: message.text,
    createdAt: moment(message.createdAt).format('LT')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

// Show location if we get 'locationMessage' event from server!
socket.on('locationMessage', (data) => {
  const html = Mustache.render(locationTemplate, {
    user: data.user,
    location: data.url,
    createdAt: moment(data.createdAt).format('LT')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

// We send a 'sendMessage' event to server with the
// form input value on submit btn click
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  messageFormBtn.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    messageFormBtn.removeAttribute('disabled');
    messageFormInput.value = '';
    messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
});

// We send a 'sendLocation' event to server if the
// geolocation api is available in their browser
sendLocationBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sendLocationBtn.setAttribute('disabled', 'disabled');
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      sendLocationBtn.removeAttribute('disabled');
      console.log('Location shared!');
    });
  });
});

// Sending query strings to server
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(usersListTemplate, {
    users,
    room
  });
  chatSidebar.innerHTML = html;
});
