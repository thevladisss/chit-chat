const NetworkService = require('../service/network.service');
const { getVendorByMac } = require('../utils/network');
const getAllNetworkNodes = async (req, res) => {
  let data = await NetworkService.getLocalNetworkNodes();

  const promises = data.map(async (node) => {
    const vendor = await getVendorByMac(node.macAddress);

    return {
      ...node,
      vendor,
    };
  });

  data = await Promise.all(promises);

  console.log(req.headers.cookie);

  return res.json({ data }).status(200);
};

const getNetworkNodeByIP = async (req, res) => {
  const { ip } = req.body;

  const data = await NetworkService.getNetworkNodeByIPAddress(ip);

  return res.json({ data }).status(200);
};

const getAllOnlineUsers = async (req, res) => {
  // return NetworkService.ge(req.sessionId);
};

module.exports = { getAllNetworkNodes, getNetworkNodeByIP, getAllOnlineUsers };
