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
};
