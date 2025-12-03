// utils/tokenCleanup.js
const connection = require('../connection/connection');

function blacklistExpiredTokens() {
  const sql = `UPDATE active_tokens SET is_blacklisted = 1 WHERE  access_expires_at < NOW() AND last_activity < access_expires_at AND is_blacklisted = 0;`;

  connection.query(sql, (err, result) => {
    if (err) return console.error("Blacklist Error:", err);

    if (result.affectedRows)
      console.log("Blacklisted expired tokens:", result.affectedRows);
  });
}

function deleteOldBlacklistedTokens() {
  const sql = `
    DELETE FROM active_tokens
    WHERE 
      is_blacklisted = 1
  `;

  connection.query(sql, (err, result) => {
    if (err) return console.error("Delete Error:", err);

    if (result.affectedRows)
      console.log("Deleted old blacklisted tokens:", result.affectedRows);
  });
}

module.exports = {
  blacklistExpiredTokens,
  deleteOldBlacklistedTokens
};
