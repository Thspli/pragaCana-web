(async () => {
  try {
    const res = await fetch('http://localhost:3333/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Teste Front Script',
        email: 'teste_front_script@example.com',
        senha: 'senha123',
        telefone: '99999999',
        fazenda: 'Fazenda Script'
      })
    });

    const data = await res.json().catch(() => ({}));
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', data);
  } catch (err) {
    console.error('ERROR:', err);
  }
})();
