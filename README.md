# 🛒 Sistema de Controle de Entradas e Saídas de Vendas

## ✅ Descrição do Sistema

Sistema para controle de vendas (entradas) e retiradas (saídas), com persistência em banco de dados, cálculo automático de totais diários e semanais, e histórico detalhado.

## 🎯 Funcionalidade Principal

- Salvar vendas (entradas) e retiradas (saídas) no banco de dados.
- Exibir total atualizado automaticamente.
- Gerenciar registros diários, semanais e históricos.

---

## ✅ Funcionalidades Detalhadas

### 📥 Cadastro de Vendas
- Seleção do item vendido.
- Inserção do valor da venda.
- Registro automático de data e horário da venda.

### 🔄 Atualização de Totais
- A cada nova venda, o valor total do dia aumenta automaticamente.
- Em caso de retirada, o valor é subtraído, mantendo o total sempre atualizado.

### 📅 Fechamento Diário
- A cada 24 horas:
  - Fecha os dados do dia.
  - Salva o total com o formato:  
    **→ Data: DD/MM/AAAA | Valor total: R$ XXXX**
  - Reinicia o controle para o próximo dia útil.

### 📊 Histórico e Visualização
- Acesso aos registros de dias anteriores.
- Ao selecionar uma data, exibe:
  - Todas as vendas realizadas.
  - Todas as retiradas feitas.

### 📆 Fechamento Semanal
- Após 7 dias, permite:
  - Fechar as vendas da semana.
  - Exibir o total obtido na semana.

---

## ✅ Requisitos Técnicos

### 🗄️ Banco de Dados: Estrutura Sugerida
- **vendas**:  
  `id`, `item`, `valor`, `data_hora`, `tipo` (`entrada`/`retirada`)

- **fechamentos_diarios**:  
  `id`, `data`, `total`

- **fechamentos_semanais**:  
  `id`, `semana`, `total`

### ⚙️ Tecnologias Utilizadas
- **Backend**: JavaScript (Node.js + Express)
- **Banco de Dados**: MySQL ou PostgreSQL
- **Agendador de tarefas**: node-cron (para fechamentos automáticos)
- **Frontend**: HTML + TailwindCSS + JavaScript  
  *(Sugestão: evoluir para React.js ou Vue.js)*

---

## ✅ Fluxo Geral do Sistema

1. **Venda registrada** → valor somado ao total do dia.
2. **Retirada registrada** → valor subtraído do total do dia.
3. **Após 24h** → total do dia salvo e reiniciado.
4. **Após 7 dias** → somatório da semana salvo.
5. **Usuário** → consulta histórico de qualquer dia/semana com detalhamento.

---

## ✅ Estrutura Geral do Projeto

### 🖥️ Página Principal
- **Total do dia**: R$ XXXX
- **Formulário**:  
  [Selecionar item] + [Valor] + [Entrada/Saída] → [Salvar]
- **Lista**:  
  Últimas vendas do dia

### 🗓️ Histórico
- **Lista**:
  - Data: 21/05/2025 → Total: R$ 800,00 → [Ver detalhes]
  - Data: 20/05/2025 → Total: R$ 650,00 → [Ver detalhes]
- **Detalhes**:  
  Lista completa das vendas/saídas daquele dia.

### 📑 Fechamento Semanal
- [Fechar semana] → Exibe:  
  Semana X → Total: R$ XXXX

---

## ✅ Lembretes Importantes

- ⏱️ Manter controle rigoroso de datas e horários (fuso horário).
- ✅ Validar entradas: valores positivos e campos obrigatórios.
- 🔒 Implementar autenticação para vendedores.

---

## 🚀 Como Contribuir
1. Fork este repositório.
2. Crie sua branch: `git checkout -b feature/sua-feature`
3. Commit suas alterações: `git commit -m 'feat: sua feature'`
4. Push para a branch: `git push origin feature/sua-feature`
5. Abra um Pull Request.

---

## 📄 Licença
Este projeto está licenciado sob a [sua licença preferida].

---

## ✅ Instruções de Instalação e Execução

### 🔧 Pré-requisitos
- Node.js
- MySQL ou PostgreSQL
- npm ou yarn

### 🚀 Instalação

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
npm install
