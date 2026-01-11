
const mapMessageToResponse = (userId, message) => {
  return {
    ...message.toJSON(),
    isPersonal: message.userId.toString() === userId,
  };
};

const mapMessagesToResponse = (userId, messages) => {
  return messages.map((message) => mapMessageToResponse(userId, message));
};

module.exports = {
  mapMessageToResponse,
  mapMessagesToResponse,
};
