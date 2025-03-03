const UserService = require('../service/user.service');
const createUser = async (req, res) => {
  const { username } = req.body;

  const user = await UserService.signUpUser(username);

  if (user) {
    req.session.user = user;
  }

  return res.json({ data: user }).status(200);
};

module.exports = {
  createUser,
};
