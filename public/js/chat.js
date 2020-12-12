const socket = io();

// Elements
const messageForm = document.querySelector('#message-form');
const messageFormInput = messageForm.querySelector('input');
const messageFormBtn = messageForm.querySelector('button');
const sendLocationBtn = document.querySelector('#sendLocation');

// Show message if we get 'message' event from server!
socket.on('message', (data) => console.log(data));

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
