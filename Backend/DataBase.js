const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'vendas.db');
const db = new sqlite3.Database(dbPath);

// Cria a tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT NOT NULL,
        valor REAL NOT NULL,
        tipo TEXT NOT NULL,
        pagamento TEXT NOT NULL, -- NOVO
        data TEXT NOT NULL
    )
  `);
});

module.exports = db;