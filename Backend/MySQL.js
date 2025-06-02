const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12435687',
  database: 'Kontrolla',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const createTables = async () => {
  try {
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        data DATE NOT NULL,
        forma_pagamento VARCHAR(100) NOT NULL
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS fechamentos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data DATE NOT NULL,
        total DECIMAL(10,2) NOT NULL
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS historico_semanal (
        id INT AUTO_INCREMENT PRIMARY KEY,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        total DECIMAL(10,2) NOT NULL
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS vendas_fechadas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        data DATE NOT NULL,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        forma_pagamento VARCHAR(100)
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS historico_vendas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        tipo VARCHAR(100) NOT NULL,
        data DATE NOT NULL,
        forma_pagamento VARCHAR(100)
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(20) NOT NULL UNIQUE,
        tipo_conta VARCHAR(50) NOT NULL,
        senha VARCHAR(255) NOT NULL
      );
    `);
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
};

createTables();

module.exports = promisePool;