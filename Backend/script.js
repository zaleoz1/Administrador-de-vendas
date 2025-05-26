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
    `INSERT INTO fechamentos (data, total) VALUES (?, ?)`,
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
  const db = require('./DataBase');
  // Seleciona vendas do dia que ainda não estão no histórico
  db.all(
    `SELECT v.* FROM vendas v
         LEFT JOIN historico_vendas h
         ON v.item = h.item AND v.valor = h.valor AND v.tipo = h.tipo AND v.data = h.data
         WHERE v.data = ? AND h.rowid IS NULL`,
    [data],
    (err, vendasNovas) => {
      if (err) return callback(err);
      if (!vendasNovas.length) return callback(null, 0); // Nada novo para copiar

      // Insere cada venda nova no histórico
      const insert = db.prepare(
        'INSERT INTO historico_vendas (item, valor, tipo, data) VALUES (?, ?, ?, ?)'
      );
      vendasNovas.forEach((venda) => {
        insert.run([venda.item, venda.valor, venda.tipo, venda.data]);
      });
      insert.finalize((err) => callback(err, vendasNovas.length));
    }
  );
}

function inserirFechamentoSemanal(dataInicio, dataFim, total, callback) {
  db.run(
    'INSERT INTO historico_semanal (data_inicio, data_fim, total) VALUES (?, ?, ?)',
    [dataInicio, dataFim, total],
    function (err) {
      callback(err, this?.lastID);
    }
  );
}

function listarFechamentosSemanais(callback) {
  db.all(
    'SELECT * FROM historico_semanal ORDER BY data_inicio DESC',
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
  copiarVendasParaHistorico, // adicione aqui
  inserirFechamentoSemanal,
  listarFechamentosSemanais,
};