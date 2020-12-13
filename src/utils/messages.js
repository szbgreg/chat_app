const generateMessage = (user, text) => {
  return {
    user,
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocatonMessage = (user, url) => {
  return {
    user,
    url,
    createdAt: new Date().getTime()
  };
};

module.exports = { generateMessage, generateLocatonMessage };
