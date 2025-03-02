/**
 *
 * @param fileInfo { {
 *    nodeIp: string;
 *    fileName: string
 *    size: string;
 *    extension: string
 *  }
 * }
 */
const requestUpload = async (req, res) => {
  /**
   * @property {string} fieldname
   * @property {string} originalname
   * @property {string} encoding
   * @property {string} mimetype
   * @property {string} destination
   * @property {string} filename
   * @property {string} path
   * @property {number} size
   */
  const file = req.file;

  const mac = req.body.mac;

  /**
   * We want to validate file
   */
};

const uploadFile = async (req, res) => {
  const { mac } = req.body;
  const file = req.file;

  return res.send();
};

module.exports = {
  requestUpload,
  uploadFile,
};
