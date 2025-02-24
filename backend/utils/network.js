const execCb = require('child_process').exec;
const os = require('os');
const dns = require('dns').promises;
const { promisify } = require('util');
const ping = require('ping').promise;
const http = require('../http');

const exec = promisify(execCb);

/**
 *
 * @return {null|string}
 */
const getLocalIP = () => {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return null; // If no external IP found
};

/**
 *
 * @return {Promise<{
 *   ip: string
 *   mac: string
 * }[]>}
 */
const getNetworkInterfaces = () => {
  return new Promise((res, rej) => {
    exec('arp -a', (error, stdout, stderr) => {
      if (stdout) {
        const devices = stdout
          .split('\n')
          .map((line) => {
            const match = line.match(/\(([\d.]+)\) at ([0-9a-fA-F:-]+)/);
            return match ? { ip: match[1], mac: match[2] } : null;
          })
          .filter(Boolean)
          .filter(({ ip }) => {
            return ip !== getLocalIP();
          });

        res(devices);
      } else if (stderr) {
        rej([]);
      }
    });
  });
};

/**
 *
 * @return {str[]}
 */
const getLocalIPs = () => {
  const networkInterfaces = os.networkInterfaces();

  const addresses = [];
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push(interface.address);
      }
    });
  });
  return addresses;
};

const getNetworkNodeByIP = async (ip) => {
  try {
    const result = await dns.reverse(ip);

    return result;
  } catch (e) {
    console.log('Catch error', e);
    return null;
  }
};

const getDeviceOnlineStatus = async (ip, deadline = 3) => {
  return ping.probe(ip, { deadline });
};

/**
 *
 * @param mac {string}
 * @return {string | null}
 */
const getVendorByMac = async (mac) => {
  try {
    const { data } = await http.get(`https://api.macvendors.com/${mac}`);

    return data;
  } catch (e) {
    return null;
  }
};

module.exports = {
  getVendorByMac,
  getDeviceOnlineStatus,
  getNetworkInterfaces,
  getLocalIPs,
  getNetworkNodeByIP,
};
