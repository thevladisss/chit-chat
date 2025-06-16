/**
 *
 * @param session {Record<string, any>}
 * @return {{
 *   userId: string;
 *   username: string;
 * } | null}
 */
const getUserFromSession = (session) => {
  return session.user ?? null;
};

module.exports = {
  getUserFromSession,
};
