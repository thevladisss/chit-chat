const {
  getNetworkInterfaces,
  getLocalIPs,
  getNetworkNodeByIP,
  getDeviceOnlineStatus,
} = require('../utils/network');

/**
 *
 * @return {Promise<{macAddress: string, ipAddress: string}[]>}
 */
const getLocalNetworkNodes = async () => {
  const networkNodes = await getNetworkInterfaces();

  const data = [];

  for (const node of networkNodes) {
    const status = await getDeviceOnlineStatus(node.ip);

    data.push({
      online: status ? status.alive : false,
      ipAddress: node.ip,
      macAddress: node.mac,
    });
  }

  return data;
};

const getNetworkNodeByIPAddress = async (ip) => {
  return await getDeviceOnlineStatus(ip);
};

module.exports = { getLocalNetworkNodes, getNetworkNodeByIPAddress };
