const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    return { wallets: {}, balances: {}, daily_claims: {}, transactions: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  linkWallet(username, address) {
    const data = load();
    data.wallets[username.toLowerCase()] = address;
    save(data);
  },

  getWallet(username) {
    const data = load();
    const address = data.wallets[username.toLowerCase()];
    return address ? { wallet_address: address } : null;
  },

  getBalance(username) {
    const data = load();
    return data.balances[username.toLowerCase()] || 0;
  },

  credit(username, amount) {
    const data = load();
    const key = username.toLowerCase();
    data.balances[key] = (data.balances[key] || 0) + amount;
    data.transactions.push({ username: key, type: 'credit', amount, created_at: Date.now() });
    save(data);
  },

  debit(username, amount) {
    const data = load();
    const key = username.toLowerCase();
    const bal = data.balances[key] || 0;
    if (bal < amount) return false;
    data.balances[key] = bal - amount;
    save(data);
    return true;
  },

  logWithdrawal(username, amount, signature) {
    const data = load();
    data.transactions.push({ username: username.toLowerCase(), type: 'withdraw', amount, signature, created_at: Date.now() });
    save(data);
  },

  dailyClaim(username, amount) {
    const today = new Date().toISOString().slice(0, 10);
    const data = load();
    const key = username.toLowerCase();
    if (data.daily_claims[key] === today) {
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      return { claimed: false, next_reset: tomorrow.toISOString() };
    }
    data.daily_claims[key] = today;
    data.balances[key] = (data.balances[key] || 0) + amount;
    data.transactions.push({ username: key, type: 'daily', amount, created_at: Date.now() });
    save(data);
    return { claimed: true, amount };
  },
};
