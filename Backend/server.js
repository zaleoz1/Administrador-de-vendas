const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { inserirVenda, listarVendasPorData, inserirFechamento, listarFechamentos } = require('./script');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rota para inserir venda
app.post('/api/vendas', (req, res) => {
    const { item, valor, tipo, data } = req.body;
    inserirVenda(item, valor, tipo, data, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
});

// Rota para listar vendas do dia
app.get('/api/vendas', (req, res) => {
    const { data } = req.query;
    listarVendasPorData(data, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ROTA PARA INSERIR FECHAMENTO
app.post('/api/fechamentos', (req, res) => {
    const { data, total } = req.body;
    inserirFechamento(data, total, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
});

// ROTA PARA LISTAR FECHAMENTOS
app.get('/api/fechamentos', (req, res) => {
    listarFechamentos((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});