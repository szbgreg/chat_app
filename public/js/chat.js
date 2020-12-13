const socket = io();

// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormBtn = messageForm.querySelector('button');
const sendLocationBtn = document.querySelector('#sendLocation');
const messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// Show message if we get 'message' event from server!
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format('LT')
  });
  messages.insertAdjacentHTML('beforeend', html);
});

// Show location if we get 'locationMessage' event from server!
socket.on('locationMessage', (data) => {
  const html = Mustache.render(locationTemplate, {
    location: data.url,
    createdAt: moment(data.createdAt).format('LT')
  });
  messages.insertAdjacentHTML('beforeend', html);
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
