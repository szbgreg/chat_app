const socket = io();

// Show message if we get 'message' event from server!
socket.on('message', (data) => console.log(data));

// We send a 'sendMessage' event to server with the
// form input value on submit btn click
document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message delivered');
  });
});

// We send a 'sendLocation' event to server if the
// geolocation api is available in their browser
document.querySelector('#sendLocation').addEventListener('click', (e) => {
  e.preventDefault();
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      console.log('Location shared!');
    });
  });
});
