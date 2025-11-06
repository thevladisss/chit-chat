const ServerChatEventEnum = {
  CONNECTION_ESTABLISHED: "connection_established",
  NEW_CONNECTION: "new_connection",
  NEW_USER: "new_user",
  LEAVE_CONNECTION: "leave_connection",
  ROOM_JOIN_SUCCESS: "room_join_success",
  MESSAGE: "new_message",
  CHAT_CREATED: "new_chat_created"
}

module.exports = ServerChatEventEnum;
