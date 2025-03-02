const ConnectionService = require('../service/connection.service');
const getOnlineUsers = async (req, res) => {
  const connections = await ConnectionService.getAllConnections(req.session.id);

  return res
    .json({
      data: connections,
    })
    .status(200);
};

const getMessagesHistory = async (req, res) => {};

module.exports = {
  getOnlineUsers,
};
