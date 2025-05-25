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
    `INSERT INTO fechamentos (data, total) VALUES (?, ?)
     ON CONFLICT(data) DO UPDATE SET total = total + excluded.total`,
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

function copiarVendasParaHistorico(data, callback) {
  // Apenas insere, sem apagar o que já existe
  db.run(
    `INSERT INTO historico_vendas (item, valor, tipo, data)
     SELECT item, valor, tipo, data FROM vendas WHERE data = ?`,
    [data],
    function (err) {
      callback(err, this?.changes);
    }
  );
}

module.exports = {
  inserirVenda,
  listarVendasPorData,
  inserirFechamento,
  listarFechamentos,
  copiarVendasParaHistorico, // adicione aqui
};