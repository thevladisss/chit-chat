const { v4 } = require('uuid');
/**
 *
 * @type {Map<string, {
 *   userId: string,
 *   username: string,
 *   createdTimestamp: number
 * }>}
 */
const db = new Map();

const createOrFindFirstUser = (username) => {
  const users = [...db.values()];

  let user = users.find((u) => u.username === username);

  if (user) return user;

  user = {
    userId: v4(),
    username,
    createdTimestamp: Date.now(),
  };

  db.set(user.userId, user);

  return Promise.resolve(user);
};

module.exports = {
  createOrFindFirstUser,
};
