✅ Descrição do Sistema: Controle de Entradas e Saídas de Vendas
🎯 Funcionalidade principal:
Salvar vendas (entradas) e retiradas (saídas) em um banco de dados.

Exibir total atualizado automaticamente.

Gerenciar registros diários, semanais e históricos.

✅ Funcionalidades detalhadas:
1. Cadastro de Vendas:
O vendedor seleciona o item vendido.

Insere o valor da venda.

O sistema registra automaticamente a data e o horário da venda.

2. Atualização de Totais:
A cada nova venda, o valor total do dia aumenta automaticamente.

Caso haja uma retirada, o valor é subtraído do total, mantendo o valor sempre atualizado.

3. Fechamento Diário:
A cada 24 horas, o sistema:

Fecha os dados do dia.

Salva o total com o seguinte formato:
→ Data: 21/05/2025 | Valor total: R$ 800,00

Reinicia o controle com um novo total em branco no próximo dia útil.

4. Histórico e Visualização:
O usuário pode acessar os registros de dias anteriores.

Ao clicar sobre uma data, o sistema exibe:

Todas as vendas realizadas naquele dia.

Todas as retiradas feitas naquele dia.

5. Fechamento Semanal:
Após 7 dias, o sistema permite ao vendedor:

Fechar as vendas da semana.

Exibir o valor total obtido ao longo da semana.

✅ Requisitos Técnicos:
🗄️ Banco de Dados:
Tabelas sugeridas:

vendas (id, item, valor, data_hora, tipo [entrada/retirada])

fechamentos_diarios (id, data, total)

fechamentos_semanais (id, semana, total)

✅ Fluxo geral:
Venda registrada → valor somado ao total do dia.

Retirada registrada → valor subtraído do total do dia.

Após 24h → total do dia é salvo e reiniciado.

Após 7 dias → somatório da semana salvo.

Usuário → pode consultar histórico de qualquer dia/semana, e ver o detalhamento.

✅ Sugestões de Tecnologias:
Backend:
Node.js com Express ou Python Flask/Django.

Agendador de tarefas: Node-cron ou Celery para fechamentos automáticos.

Frontend:
React.js ou Vue.js.

Interface com:

Formulário para inserir vendas/retiradas.

Tabela com valores diários.

Botões de visualização de históricos.

Banco de Dados:
MySQL, PostgreSQL ou SQLite (para sistemas menores).

✅ Exemplo de interface:
Página principal:

Total do dia: R$ XXXX

Formulário: [Selecionar item] + [Valor] + [Entrada/Saída] → [Salvar]

Lista: Últimas vendas do dia.

Histórico:

Lista:

Data: 21/05/2025 → Total: R$ 800,00 → [Ver detalhes]

Data: 20/05/2025 → Total: R$ 650,00 → [Ver detalhes]

Detalhes: Lista completa das vendas/saídas daquele dia.

Fechamento semanal:

[Fechar semana] → Exibe: Semana X → Total: R$ XXXX

✅ Lembretes importantes:
Manter controle rigoroso de datas/hora (fuso horário).

Validar entradas: valores positivos, campos obrigatórios.

Segurança: autenticação para o vendedor.
