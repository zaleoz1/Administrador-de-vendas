document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cpf = document.getElementById('usuario').value.replace(/\D/g, ''); // <-- normaliza CPF
    const senha = document.getElementById('senha').value.trim();

    const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha })
    });
    const data = await res.json();
    if (res.ok && data.success) {
        localStorage.setItem('usuarioLogado', JSON.stringify({ cpf, nome: data.nome, tipo_conta: data.tipo_conta }));
        window.location.href = "index.html";
    } else {
        alert("CPF ou senha incorretos! Eles devem ser digitados exatamente como cadastrados.\n\nDica: verifique se digitou todos os números do CPF e se a senha está correta.");
    }
});

document.getElementById('toggleSenha').addEventListener('click', function() {
    const input = document.getElementById('senha');
    if (input.type === 'password') {
        input.type = 'text';
        this.textContent = '🙈';
    } else {
        input.type = 'password';
        this.textContent = '👁️';
    }
});