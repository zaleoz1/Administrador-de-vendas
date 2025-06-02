const db = require('./MySQL');

// Inserir venda
async function inserirVenda(item, valor, tipo, data, forma_pagamento, callback) {
  try {
    const [result] = await db.execute(
      'INSERT INTO vendas (item, valor, tipo, data, forma_pagamento) VALUES (?, ?, ?, ?, ?)',
      [item, valor, tipo, data, forma_pagamento]
    );
    callback(null, result.insertId);
  } catch (err) {
    callback(err);
  }
}

// Listar vendas por data
async function listarVendasPorData(data, callback) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM vendas WHERE data = ?',
      [data]
    );
    callback(null, rows);
  } catch (err) {
    callback(err);
  }
}

// Inserir fechamento diário
async function inserirFechamento(data, total, callback) {
  try {
    const [result] = await db.execute(
      'INSERT INTO fechamentos (data, total) VALUES (?, ?)',
      [data, total]
    );
    callback(null, result.insertId);
  } catch (err) {
    callback(err);
  }
}

// Listar fechamentos
async function listarFechamentos(callback) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM fechamentos ORDER BY data DESC'
    );
    callback(null, rows);
  } catch (err) {
    callback(err);
  }
}

// Copiar vendas para histórico
async function copiarVendasParaHistorico(data, callback) {
  try {
    const [vendas] = await db.execute('SELECT * FROM vendas WHERE data = ?', [data]);
    for (const v of vendas) {
      // Converte para string se for Date, e pega só a data (YYYY-MM-DD)
      const dataVenda = typeof v.data === 'string' ? v.data.slice(0, 10) : v.data.toISOString().slice(0, 10);
      await db.execute(
        'INSERT INTO historico_vendas (item, valor, tipo, data, forma_pagamento) VALUES (?, ?, ?, ?, ?)',
        [v.item, v.valor, v.tipo, dataVenda, v.forma_pagamento]
      );
    }
    callback(null);
  } catch (err) {
    callback(err);
  }
}

// Inserir fechamento semanal
async function inserirFechamentoSemanal(dataInicio, dataFim, total, callback) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM historico_semanal WHERE data_inicio = ? AND data_fim = ?',
      [dataInicio, dataFim]
    );
    if (rows.length) {
      const novoTotal = Number(rows[0].total) + Number(total);
      await db.execute(
        'UPDATE historico_semanal SET total = ? WHERE data_inicio = ? AND data_fim = ?',
        [novoTotal, dataInicio, dataFim]
      );
      callback(null, rows[0].id);
    } else {
      const [result] = await db.execute(
        'INSERT INTO historico_semanal (data_inicio, data_fim, total) VALUES (?, ?, ?)',
        [dataInicio, dataFim, total]
      );
      callback(null, result.insertId);
    }
  } catch (err) {
    callback(err);
  }
}

// Listar fechamentos semanais
async function listarFechamentosSemanais(callback) {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM historico_semanal ORDER BY data_inicio DESC'
    );
    callback(null, rows);
  } catch (err) {
    callback(err);
  }
}

// Inserir usuário
async function inserirUsuario(nome, cpf, tipo_conta, senha, callback) {
  try {
    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, cpf, tipo_conta, senha) VALUES (?, ?, ?, ?)',
      [nome, cpf, tipo_conta, senha]
    );
    callback(null, result.insertId);
  } catch (err) {
    callback(err);
  }
}

module.exports = {
  inserirVenda,
  listarVendasPorData,
  inserirFechamento,
  listarFechamentos,
  copiarVendasParaHistorico,
  inserirFechamentoSemanal,
  listarFechamentosSemanais,
  inserirUsuario,
};