document.addEventListener('DOMContentLoaded', () => {
    // --- VARIÁVEIS E FUNÇÕES ---
    const form = document.getElementById('form-venda');
    const lista = document.getElementById('lista-vendas-dia');
    const totalDia = document.getElementById('total-dia');
    const semVendas = document.getElementById('sem-vendas');
    const btnFecharCaixa = document.getElementById('fechar-caixa');
    const btnHistoricoDesktop = document.querySelector('.sm\\:flex button.bg-blue-500');
    const btnHistoricoMobile = document.querySelector('#mobile-menu button.bg-blue-500');
    const modal = document.getElementById('modal-historico');
    const fecharModal = document.getElementById('fechar-modal-historico');

    function formatarValor(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dataHoje() {
        const hoje = new Date();
        return hoje.toISOString().slice(0, 10);
    }

    function carregarVendas() {
        if (!lista) return; // Adicione esta linha para evitar erro se o elemento não existir
        fetch(`http://localhost:3001/api/vendas?data=${dataHoje()}`)
            .then(res => res.json())
            .then(vendas => {
                lista.innerHTML = '';
                let total = 0;
                if (vendas.length === 0) {
                    lista.innerHTML = '<li class="text-gray-400 text-center py-2" id="sem-vendas">Nenhum registro hoje.</li>';
                } else {
                    vendas.forEach(venda => {
                        const sinal = venda.tipo === 'retirada' ? '-' : '+';
                        const cor = venda.tipo === 'retirada' ? 'text-red-500' : 'text-green-600';
                        lista.innerHTML += `
                            <li class="flex justify-between items-center py-2">
                                <span>${venda.item}</span>
                                <span class="font-bold ${cor}">${sinal} ${formatarValor(venda.valor)}</span>
                            </li>
                        `;
                        total += venda.tipo === 'retirada' ? -venda.valor : venda.valor;
                    });
                }
                totalDia.textContent = formatarValor(total);
            });
    }

    function buscarVendasPorData(data) {
        return fetch(`http://localhost:3001/api/vendas?data=${data}`)
            .then(res => res.json());
    }

    function buscarVendasHistoricoPorData(data) {
        return fetch(`http://localhost:3001/api/historico-vendas?data=${data}`)
            .then(res => res.json());
    }

    async function atualizarHistoricoDiario() {
        const ul = document.getElementById('historico-diario');
        if (!ul) return;
        ul.innerHTML = '';
        const fechamentos = await fetch('http://localhost:3001/api/fechamentos').then(r => r.json());
        fechamentos.forEach((fechamento, idx) => {
            const dataFormatada = fechamento.data.split('-').reverse().join('/');
            ul.innerHTML += `
                <li class="flex justify-between items-center py-2">
                    <span>${dataFormatada}</span>
                    <span class="font-bold text-blue-500">${Number(fechamento.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <button class="text-blue-500 underline hover:font-bold" data-data="${fechamento.data}">Ver detalhes</button>
                </li>
            `;
        });
        // Eventos dos botões "Ver detalhes"
        ul.querySelectorAll('button[data-data]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const data = btn.getAttribute('data-data');
                const vendas = await buscarVendasHistoricoPorData(data);
                mostrarDetalhesHistorico(data, vendas);
            });
        });
    }

    function mostrarDetalhesHistorico(data, vendas) {
        let html = `<h3 class="text-lg font-bold mb-2">Detalhes do dia ${data.split('-').reverse().join('/')}</h3>`;
        html += `<ul class="divide-y mb-4">`;
        let total = 0;
        vendas.forEach(venda => {
            const sinal = venda.tipo === 'retirada' ? '-' : '+';
            const cor = venda.tipo === 'retirada' ? 'text-red-500' : 'text-green-600';
            html += `
                <li class="flex justify-between items-center py-2">
                    <span>${venda.item}</span>
                    <span class="font-bold ${cor}">${sinal} ${parseFloat(venda.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </li>
            `;
            total += venda.tipo === 'retirada' ? -venda.valor : venda.valor;
        });
        html += `</ul>`;
        html += `
            <div class="flex justify-between items-center font-bold">
                <span>Total: <span class="text-blue-500">${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                <button id="btn-voltar-modal-interno" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold hover:bg-gray-300 transition ml-4">Voltar</button>
            </div>
        `;

        // Mostra no modal
        const modal = document.getElementById('modal-detalhes-historico');
        const conteudo = document.getElementById('detalhes-historico-conteudo');
        if (conteudo && modal) {
            conteudo.innerHTML = html;
            modal.classList.remove('hidden');
            // Evento do botão voltar interno
            const btnVoltarInterno = document.getElementById('btn-voltar-modal-interno');
            if (btnVoltarInterno) {
                btnVoltarInterno.onclick = () => modal.classList.add('hidden');
            }
        }
    }

    // --- EVENTOS ---

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const item = form.item.value;
            const valor = parseFloat(form.valor.value);
            const tipo = form.tipo.value;
            const data = dataHoje();

            fetch('http://localhost:3001/api/vendas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item, valor, tipo, data })
            })
            .then(res => res.json())
            .then(() => {
                form.reset();
                carregarVendas();
            });
        });
    }

    if (btnFecharCaixa) {
        btnFecharCaixa.addEventListener('click', async () => {
            const data = dataHoje();
            const vendas = await buscarVendasPorData(data);
            if (vendas.length === 0) {
                alert('Nenhum registro para fechar hoje.');
                return;
            }
            let total = 0;
            vendas.forEach(venda => {
                total += venda.tipo === 'retirada' ? -venda.valor : venda.valor;
            });
            const resp = await fetch('http://localhost:3001/api/fechamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, total })
            });
            if (!resp.ok) {
                const erro = await resp.json();
                alert(erro.error || 'Erro ao fechar o caixa.');
                return;
            }

            // Apaga as vendas do dia no banco
            await fetch(`http://localhost:3001/api/vendas?data=${data}`, {
                method: 'DELETE'
            });

            alert('Caixa do dia fechado e salvo no histórico!');
            atualizarHistoricoDiario();

            // Limpa a lista de vendas do dia
            if (lista) {
                // Aqui você pode limpar manualmente ou recarregar:
                carregarVendas();
            }
            // Atualiza o total do dia
            if (totalDia) {
                totalDia.textContent = 'R$ 0,00';
            }
        });
    }

    if (btnHistoricoDesktop) btnHistoricoDesktop.addEventListener('click', () => {
        modal.classList.remove('hidden');
        atualizarHistoricoDiario();
    });
    if (btnHistoricoMobile) btnHistoricoMobile.addEventListener('click', () => {
        modal.classList.remove('hidden');
        atualizarHistoricoDiario();
    });
    if (fecharModal) fecharModal.addEventListener('click', () => modal.classList.add('hidden'));
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    // Carregar vendas do dia ao iniciar
    carregarVendas();

    // Adicione esta linha para carregar o histórico ao abrir o historic.html
    if (document.getElementById('historico-diario')) {
        atualizarHistoricoDiario();
    }

    const formFiltro = document.getElementById('form-filtro-data');
    const inputFiltro = document.getElementById('filtro-data');
    const btnLimparFiltro = document.getElementById('limpar-filtro');

    if (formFiltro && inputFiltro) {
        formFiltro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = inputFiltro.value;
            const ul = document.getElementById('historico-diario');
            ul.innerHTML = '';
            if (!data) {
                await atualizarHistoricoDiario();
                return;
            }
            // Busca fechamentos apenas para a data selecionada
            const fechamentos = await fetch('http://localhost:3001/api/fechamentos').then(r => r.json());
            const fechamento = fechamentos.find(f => f.data === data);
            if (!fechamento) {
                ul.innerHTML = '<li class="text-gray-400 text-center py-2" id="sem-historico">Nenhum registro encontrado.</li>';
                return;
            }
            const dataFormatada = fechamento.data.split('-').reverse().join('/');
            ul.innerHTML = `
                <li class="flex justify-between items-center py-2">
                    <span>${dataFormatada}</span>
                    <span class="font-bold text-blue-500">${Number(fechamento.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <button class="text-blue-500 underline hover:font-bold" data-data="${fechamento.data}">Ver detalhes</button>
                </li>
            `;
            // Reaplica evento do botão "Ver detalhes"
            ul.querySelectorAll('button[data-data]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const data = btn.getAttribute('data-data');
                    const vendas = await buscarVendasHistoricoPorData(data);
                    mostrarDetalhesHistorico(data, vendas);
                });
            });
        });
    }

    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener('click', async () => {
            inputFiltro.value = '';
            await atualizarHistoricoDiario();
        });
    }

    // --- MENU HAMBURGUER MOBILE ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Função para carregar todas as vendas e calcular totais
    async function carregarTabelaAjuste(filtros = {}) {
        const tabela = document.getElementById('tabela-vendas-ajuste');
        const tbody = tabela?.querySelector('tbody');
        const subtotalSpan = document.getElementById('subtotal-ajuste');
        const retiradoSpan = document.getElementById('retirado-ajuste');
        const totalSpan = document.getElementById('total-ajuste');
        if (!tbody) return;

        // Busca todas as vendas do histórico
        let vendas = await fetch('http://localhost:3001/api/historico-vendas').then(r => r.json());

        // Filtros
        if (filtros.item) {
            vendas = vendas.filter(v => v.item.toLowerCase().includes(filtros.item.toLowerCase()));
        }
        if (filtros.tipo) {
            vendas = vendas.filter(v => v.tipo === filtros.tipo);
        }
        if (filtros.data) {
            vendas = vendas.filter(v => v.data === filtros.data);
        }

        tbody.innerHTML = '';
        let subtotal = 0;
        let retirado = 0;
        vendas.forEach(venda => {
            const sinal = venda.tipo === 'retirada' ? '-' : '+';
            const cor = venda.tipo === 'retirada' ? 'text-red-500' : 'text-green-600';
            tbody.innerHTML += `
                <tr>
                    <td class="px-4 py-2">${venda.item}</td>
                    <td class="px-4 py-2">${venda.tipo}</td>
                    <td class="px-4 py-2 font-bold ${cor}">${sinal} ${parseFloat(venda.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td class="px-4 py-2">${venda.data.split('-').reverse().join('/')}</td>
                </tr>
            `;
            if (venda.tipo === 'retirada') {
                retirado += parseFloat(venda.valor);
            } else {
                subtotal += parseFloat(venda.valor);
            }
        });
        subtotalSpan.textContent = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        retiradoSpan.textContent = retirado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        totalSpan.textContent = (subtotal - retirado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Evento do formulário de filtro
    const formFiltroAjuste = document.getElementById('form-filtro-ajuste');
    if (formFiltroAjuste) {
        formFiltroAjuste.addEventListener('submit', function(e) {
            e.preventDefault();
            const item = document.getElementById('filtro-item').value;
            const tipo = document.getElementById('filtro-tipo').value;
            const data = document.getElementById('filtro-data').value;
            carregarTabelaAjuste({ item, tipo, data });
        });
        // Botão limpar filtro
        document.getElementById('limpar-filtro-ajuste').addEventListener('click', function() {
            document.getElementById('filtro-item').value = '';
            document.getElementById('filtro-tipo').value = '';
            document.getElementById('filtro-data').value = '';
            carregarTabelaAjuste();
        });
    }

    // Só executa se estiver na página de ajuste
    if (document.getElementById('tabela-vendas-ajuste')) {
        carregarTabelaAjuste();
    }

    // Função para finalizar ajuste semanal
    async function finalizarAjuste() {
        let vendas = await fetch('http://localhost:3001/api/historico-vendas').then(r => r.json());
        if (!vendas.length) {
            alert('Nenhum dado para salvar no ajuste.');
            return;
        }

        vendas.sort((a, b) => a.data.localeCompare(b.data));
        const dataInicio = vendas[0].data;
        const dataFim = vendas[vendas.length - 1].data;

        let total = 0;
        vendas.forEach(venda => {
            total += venda.tipo === 'retirada' ? -venda.valor : venda.valor;
        });

        const resp = await fetch('http://localhost:3001/api/fechamento-semanal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dataInicio,
                dataFim,
                total
            })
        });

        if (resp.ok) {       
            alert('Ajuste semanal salvo no histórico!');
            carregarTabelaAjuste(); // Atualiza a tabela

            // Remove todos os fechamentos do banco
            await fetch('http://localhost:3001/api/fechamentos', { method: 'DELETE' });

            // Limpa e atualiza o histórico diário (deixa em branco)
            if (document.getElementById('historico-diario')) {
                await atualizarHistoricoDiario();
            }
        } else {
            alert('Erro ao salvar ajuste semanal.');
        }
    }

    // Evento do botão
    const btnFinalizarAjuste = document.getElementById('finalizar-ajuste');
    if (btnFinalizarAjuste) {
        btnFinalizarAjuste.addEventListener('click', finalizarAjuste);
    }

    async function atualizarHistoricoSemanal() {
        const ul = document.getElementById('historico-semanal');
        if (!ul) return;
        ul.innerHTML = '';
        const semanais = await fetch('http://localhost:3001/api/fechamento-semanal').then(r => r.json());
        if (!semanais.length) {
            ul.innerHTML = '<li class="text-gray-400 text-center py-2" id="sem-historico-semanal">Nenhum fechamento semanal encontrado.</li>';
            return;
        }
        semanais.forEach(fechamento => {
            const dataInicio = fechamento.data_inicio.split('-').reverse().join('/');
            const dataFim = fechamento.data_fim.split('-').reverse().join('/');
            ul.innerHTML += `
                <li class="flex justify-between items-center py-2">
                    <span>${dataInicio} - ${dataFim}</span>
                    <span class="font-bold text-blue-500">${Number(fechamento.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <button class="text-blue-500 underline hover:font-bold" 
                        data-inicio="${fechamento.data_inicio}" 
                        data-fim="${fechamento.data_fim}">Ver detalhes</button>
                </li>
            `;
        });

        // Evento dos botões "Ver detalhes" do histórico semanal
        ul.querySelectorAll('button[data-inicio][data-fim]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const dataInicio = btn.getAttribute('data-inicio');
                const dataFim = btn.getAttribute('data-fim');
                // Busca vendas fechadas do histórico dentro do intervalo da semana
                let vendas = await fetch(`http://localhost:3001/api/vendas-fechadas?dataInicio=${dataInicio}&dataFim=${dataFim}`).then(r => r.json());

                // Calcula subtotal, retirado e total
                let subtotal = 0;
                let retirado = 0;
                vendas.forEach(venda => {
                    if (venda.tipo === 'retirada') {
                        retirado += parseFloat(venda.valor);
                    } else {
                        subtotal += parseFloat(venda.valor);
                    }
                });
                const total = subtotal - retirado;

                // Monta o HTML do modal
                const modal = document.getElementById('modal-detalhes-historico');
                const conteudo = document.getElementById('detalhes-historico-conteudo');
                if (conteudo && modal) {
                    conteudo.innerHTML = `
                        <h3 class="text-lg font-bold mb-2">Detalhes da semana<br>${dataInicio.split('-').reverse().join('/')} até ${dataFim.split('-').reverse().join('/')}</h3>
                        <ul class="divide-y mb-4 max-h-60 overflow-y-auto">
                            ${vendas.map(venda => `
                                <li class="flex justify-between items-center py-2">
                                    <span>${venda.item}</span>
                                    <span class="font-bold ${venda.tipo === 'retirada' ? 'text-red-500' : 'text-green-600'}">
                                        ${venda.tipo === 'retirada' ? '-' : '+'} ${parseFloat(venda.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                    <span class="text-gray-500 text-xs ml-2">${venda.data.split('-').reverse().join('/')}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <div class="flex flex-col gap-2 font-bold mb-2">
                            <span>Subtotal: <span class="text-green-600">${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                            <span>Valor Retirado: <span class="text-red-500">${retirado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                            <span>Total: <span class="text-blue-500">${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></span>
                        </div>
                        <div class="flex justify-end">
                            <button id="btn-voltar-modal-interno" class="bg-gray-200 text-gray-700 px-3 py-1 rounded font-bold hover:bg-gray-300 transition ml-4">Voltar</button>
                        </div>
                    `;
                    modal.classList.remove('hidden');
                    // Evento do botão voltar interno
                    const btnVoltarInterno = document.getElementById('btn-voltar-modal-interno');
                    if (btnVoltarInterno) {
                        btnVoltarInterno.onclick = () => modal.classList.add('hidden');
                    }
                }
            });
        });
    }

    // Chame essa função ao carregar a historic.html
    if (document.getElementById('historico-semanal')) {
        atualizarHistoricoSemanal();
    }

    // --- SEU NOVO CÓDIGO ---
    const btnAdicionar = document.getElementById('btn-adicionar-venda');
    const formVenda = document.getElementById('form-venda');
    if (btnAdicionar && formVenda) {
        btnAdicionar.addEventListener('click', function () {
            formVenda.classList.toggle('hidden');
            btnAdicionar.classList.add('hidden'); // Esconde o botão ao abrir o form
        });
    }
});