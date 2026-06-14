const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'bridge.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS wallets (
    username TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    linked_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS balances (
    username TEXT PRIMARY KEY,
    amount INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    signature TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS daily_claims (
    username TEXT PRIMARY KEY,
    last_claim_date TEXT NOT NULL
  );
`);

module.exports = {
  linkWallet(username, address) {
    db.prepare(`
      INSERT INTO wallets (username, wallet_address, linked_at)
      VALUES (?, ?, ?)
      ON CONFLICT(username) DO UPDATE SET wallet_address = excluded.wallet_address, linked_at = excluded.linked_at
    `).run(username.toLowerCase(), address, Date.now());
  },

  getWallet(username) {
    return db.prepare('SELECT wallet_address FROM wallets WHERE username = ?').get(username.toLowerCase());
  },

  getBalance(username) {
    const row = db.prepare('SELECT amount FROM balances WHERE username = ?').get(username.toLowerCase());
    return row ? row.amount : 0;
  },

  credit(username, amount) {
    db.prepare(`
      INSERT INTO balances (username, amount) VALUES (?, ?)
      ON CONFLICT(username) DO UPDATE SET amount = amount + excluded.amount
    `).run(username.toLowerCase(), amount);
    db.prepare('INSERT INTO transactions (username, type, amount, created_at) VALUES (?, ?, ?, ?)').run(username.toLowerCase(), 'deposit', amount, Date.now());
  },

  debit(username, amount) {
    const bal = this.getBalance(username);
    if (bal < amount) return false;
    db.prepare('UPDATE balances SET amount = amount - ? WHERE username = ?').run(amount, username.toLowerCase());
    return true;
  },

  logWithdrawal(username, amount, signature) {
    db.prepare('INSERT INTO transactions (username, type, amount, signature, created_at) VALUES (?, ?, ?, ?, ?)').run(username.toLowerCase(), 'withdraw', amount, signature, Date.now());
  },

  // Returns { claimed: true, amount } on first claim today, or { claimed: false, next_reset } if already claimed.
  dailyClaim(username, amount) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const row = db.prepare('SELECT last_claim_date FROM daily_claims WHERE username = ?').get(username.toLowerCase());
    if (row && row.last_claim_date === today) {
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      return { claimed: false, next_reset: tomorrow.toISOString() };
    }
    db.prepare(`
      INSERT INTO daily_claims (username, last_claim_date) VALUES (?, ?)
      ON CONFLICT(username) DO UPDATE SET last_claim_date = excluded.last_claim_date
    `).run(username.toLowerCase(), today);
    this.credit(username, amount);
    return { claimed: true, amount };
  },
};
