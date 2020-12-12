const generateMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocatonMessage = (url) => {
  return {
    url,
    createdAt: new Date().getTime()
  };
};

module.exports = { generateMessage, generateLocatonMessage };
