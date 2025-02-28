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
  const data = [];

  return data;
};

const getNetworkNodeByIPAddress = async (ip) => {
  return await getDeviceOnlineStatus(ip);
};

/**
 *
 * @param mac {string}
 * @return { Promise<boolean> }
 */
const getUploadPermissionFromNode = (mac) => {};

module.exports = { getLocalNetworkNodes, getNetworkNodeByIPAddress };
