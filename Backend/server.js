const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {
    inserirVenda,
    listarVendasPorData,
    inserirFechamento,
    listarFechamentos,
    copiarVendasParaHistorico,
    inserirFechamentoSemanal,
    listarFechamentosSemanais,
    inserirUsuario
} = require('./script');
const db = require('./MySQL');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// Rota para inserir venda
app.post('/api/vendas', (req, res) => {
    const { item, valor, tipo, data, forma_pagamento } = req.body;
    inserirVenda(item, valor, tipo, data, forma_pagamento, (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id });
    });
});

// Rota para listar vendas do dia ou todas
app.get('/api/vendas', async (req, res) => {
    const { data } = req.query;
    try {
        if (!data) {
            const [rows] = await db.execute('SELECT * FROM vendas');
            res.json(rows);
        } else {
            listarVendasPorData(data, (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA INSERIR FECHAMENTO
app.post('/api/fechamentos', async (req, res) => {
    const { data, total } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM fechamentos WHERE data = ? LIMIT 1', [data]);
        await copiarVendasParaHistorico(data, async (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (rows.length) {
                // Já existe fechamento: atualiza o total somando
                const novoTotal = Number(rows[0].total) + Number(total);
                await db.execute('UPDATE fechamentos SET total = ? WHERE data = ?', [novoTotal, data]);
                return res.json({ id: rows[0].id, atualizado: true });
            } else {
                inserirFechamento(data, total, (err, id) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ id, novo: true });
                });
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA LISTAR FECHAMENTOS
app.get('/api/fechamentos', (req, res) => {
    listarFechamentos((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ROTA PARA APAGAR VENDAS DO DIA
app.delete('/api/vendas', async (req, res) => {
    const { data } = req.query;
    try {
        const [result] = await db.execute('DELETE FROM vendas WHERE data = ?', [data]);
        res.json({ deleted: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA LISTAR HISTÓRICO DE VENDAS
app.get('/api/historico-vendas', async (req, res) => {
    const { data } = req.query;
    try {
        if (data) {
            const [rows] = await db.execute('SELECT * FROM historico_vendas WHERE data = ?', [data]);
            res.json(rows);
        } else {
            const [rows] = await db.execute('SELECT * FROM historico_vendas');
            res.json(rows);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para inserir fechamento semanal
app.post('/api/fechamento-semanal', async (req, res) => {
    const { dataInicio, dataFim, total } = req.body;
    console.log('Recebido:', { dataInicio, dataFim, total });
    try {
        const [vendas] = await db.execute('SELECT * FROM historico_vendas WHERE data >= ? AND data <= ?', [dataInicio, dataFim]);
        for (const v of vendas) {
            // Garante que só a data (YYYY-MM-DD) será salva
            const dataVenda = typeof v.data === 'string' ? v.data.slice(0, 10) : v.data.toISOString().slice(0, 10);
            await db.execute(
                'INSERT INTO vendas_fechadas (item, valor, tipo, data, data_inicio, data_fim, forma_pagamento) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [v.item, v.valor, v.tipo, dataVenda, dataInicio, dataFim, v.forma_pagamento]
            );
        }
        inserirFechamentoSemanal(dataInicio, dataFim, total, async (err, id) => {
            if (err) return res.status(500).json({ error: err.message });
            await db.execute('DELETE FROM fechamentos');
            await db.execute('DELETE FROM historico_vendas');
            res.json({ id });
        });
    } catch (err) {
        console.error('Erro no fechamento semanal:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para listar fechamentos semanais
app.get('/api/fechamento-semanal', (req, res) => {
    listarFechamentosSemanais((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ROTA PARA APAGAR VENDAS DO HISTÓRICO POR INTERVALO DE DATAS
app.delete('/api/historico-vendas', async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    if (!dataInicio || !dataFim) {
        return res.status(400).json({ error: 'Intervalo de datas obrigatório.' });
    }
    try {
        const [result] = await db.execute(
            'DELETE FROM historico_vendas WHERE data >= ? AND data <= ?',
            [dataInicio, dataFim]
        );
        res.json({ deleted: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA LISTAR VENDAS FECHADAS POR INTERVALO
app.get('/api/vendas-fechadas', async (req, res) => {
    const { dataInicio, dataFim } = req.query;
    try {
        const [rows] = await db.execute(
            "SELECT * FROM vendas_fechadas WHERE DATE(data) >= ? AND DATE(data) <= ?",
            [dataInicio, dataFim]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA CADASTRAR USUÁRIO
app.post('/api/usuarios', (req, res) => {
    const { nome, cpf, tipo_conta, senha } = req.body;
    if (!nome || !cpf || !tipo_conta || !senha) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }
    inserirUsuario(nome, cpf, tipo_conta, senha, (err, id) => {
        if (err) {
            if (err.message && err.message.includes('Duplicate entry')) {
                return res.status(400).json({ error: 'CPF já cadastrado.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ id });
    });
});

// ROTA PARA LISTAR USUÁRIOS
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT nome, cpf, tipo_conta, senha FROM usuarios');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA APAGAR USUÁRIO
app.delete('/api/usuarios/:cpf', async (req, res) => {
    const { cpf } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM usuarios WHERE cpf = ?', [cpf]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json({ deleted: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ROTA PARA LOGIN
app.post('/api/login', async (req, res) => {
    const { cpf, senha } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM usuarios WHERE cpf = ? AND senha = ?', [cpf, senha]);
        if (!rows.length) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
        const user = rows[0];
        res.json({ success: true, nome: user.nome, tipo_conta: user.tipo_conta });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/historico-diario', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT data, SUM(CASE WHEN tipo = 'retirada' THEN -valor ELSE valor END) as total
            FROM historico_vendas
            GROUP BY data
            ORDER BY data DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});