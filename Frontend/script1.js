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
                lista.innerHTML = '<li class="text-gray-400 text-center py-2" id="sem-vendas">Nenhum registro hoje.</li>';
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
});