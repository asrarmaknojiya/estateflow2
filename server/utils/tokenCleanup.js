const connection = require('../connection/connection');

function blacklistExpiredRefresh() {
  connection.query('UPDATE active_tokens SET is_blacklisted = 1 WHERE refresh_expires_at < NOW() AND is_blacklisted = 0', (err, result) => {
    if (err) return console.error('cleanup err', err);
    if (result.affectedRows) console.log('Blacklisted expired refresh tokens:', result.affectedRows);
  });
}

function deleteBlacklistedOlder() {
  connection.query('DELETE FROM active_tokens WHERE is_blacklisted = 1 AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)', (err, result) => {
    if (err) return console.error('cleanup delete err', err);
    if (result.affectedRows) console.log('Deleted blacklisted tokens:', result.affectedRows);
  });
}

module.exports = { blacklistExpiredRefresh, deleteBlacklistedOlder };
