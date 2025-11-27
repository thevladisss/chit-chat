const mapChatToResponse = (userId, chat) => {
  const chatName = chat.users
    .filter((user) => user.id !== userId)
    .map((user) => user.username)
    .join(', ');

  return {
    ...chat.toJSON(),
    lastMessage: chat.lastMessage ? chat.lastMessage.text : null,
    lastMessageTimestamp: chat.lastMessage
      ? chat.lastMessage.createdTimestamp
      : null,

    name: chatName,
    //TODO: Use messages mapper
    messages: chat.messages.map((item) => ({
      ...item.toJSON(),
      isPersonal: item.userId.toString() === userId,
    })),
  };
};

const mapChatToListResponse = (userId, chat, connections) => {
  const otherUserId = chat.users.find((user) => user.id !== userId)._id;

  //TODO: Use messages mapper
  const messages = chat.messages.map((item) => ({
    ...item.toJSON(),
    isPersonal: item.userId.toString() === userId,
  }));

  const online = connections.some(
    (connection) => connection.userId.toString() === otherUserId.toString(),
  );

  const name = chat.users.find(
    (user) => user._id.toString() !== userId,
  )?.username;

  return {
    ...chat.toJSON(),
    online,
    messages,
    name,
  };
};

module.exports = {
  mapChatToResponse,
  mapChatToListResponse,
};
