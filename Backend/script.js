const db = require('./DataBase');
// Exemplo: inserir uma venda
function inserirVenda(item, valor, tipo, data, callback) {
  db.run(
    'INSERT INTO vendas (item, valor, tipo, data) VALUES (?, ?, ?, ?)',
    [item, valor, tipo, data],
    function (err) {
      callback(err, this?.lastID);
    }
  );
}

// Exemplo: listar vendas do dia
function listarVendasPorData(data, callback) {
  db.all(
    'SELECT * FROM vendas WHERE data = ?',
    [data],
    (err, rows) => {
      callback(err, rows);
    }
  );
}

// Inserir fechamento diário
function inserirFechamento(data, total, callback) {
  db.run(
    'INSERT OR REPLACE INTO fechamentos (data, total) VALUES (?, ?)',
    [data, total],
    function (err) {
      callback(err, this?.lastID);
    }
  );
}

// Listar fechamentos
function listarFechamentos(callback) {
  db.all(
    'SELECT * FROM fechamentos ORDER BY data DESC',
    [],
    (err, rows) => {
      callback(err, rows);
    }
  );
}

module.exports = {
  inserirVenda,
  listarVendasPorData,
  inserirFechamento,
  listarFechamentos,
};