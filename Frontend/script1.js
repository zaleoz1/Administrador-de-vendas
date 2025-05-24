document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-venda');
    const lista = document.getElementById('lista-vendas-dia');
    const totalDia = document.getElementById('total-dia');
    const semVendas = document.getElementById('sem-vendas');

    function formatarValor(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dataHoje() {
        const hoje = new Date();
        return hoje.toISOString().slice(0, 10);
    }

    function carregarVendas() {
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

    carregarVendas();
});

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Modal de Histórico
document.addEventListener('DOMContentLoaded', function() {
    // Botão do header (desktop)
    const btnHistoricoDesktop = document.querySelector('.sm\\:flex button.bg-blue-500');
    // Botão do menu mobile
    const btnHistoricoMobile = document.querySelector('#mobile-menu button.bg-blue-500');
    const modal = document.getElementById('modal-historico');
    const fecharModal = document.getElementById('fechar-modal-historico');

    function abrirModal() {
        modal.classList.remove('hidden');
    }
    function fechar() {
        modal.classList.add('hidden');
    }

    if (btnHistoricoDesktop) btnHistoricoDesktop.addEventListener('click', abrirModal);
    if (btnHistoricoMobile) btnHistoricoMobile.addEventListener('click', abrirModal);
    if (fecharModal) fecharModal.addEventListener('click', fechar);

    // Fecha ao clicar fora do conteúdo
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) fechar();
        });
    }
});