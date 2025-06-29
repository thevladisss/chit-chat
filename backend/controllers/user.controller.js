const UserService = require('../service/user.service');
const createUser = async (req, res) => {
  const { username } = req.body;

  const user = await UserService.signUpUser(username);

  if (user) {
    req.session.user = user.toJSON();
  }

  return res.json({ data: user.toJSON() }).status(200);
};

module.exports = {
  createUser,
};
