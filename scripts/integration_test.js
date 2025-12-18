(async () => {
  try {
    const API = 'http://localhost:3333';
    const unique = `itest_${Date.now()}`;
    const email = `${unique}@example.com`;
    const senha = 'SenhaTeste123';

    console.log('1) Registrando usuário:', email);
    let res = await fetch(`${API}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: `Usuário ${unique}`, email, senha, telefone: '999999999', fazenda: 'Fazenda IT' })
    });
    const regBody = await res.json().catch(() => ({}));
    console.log('  Registro status:', res.status, regBody);
    if (res.status !== 201 && res.status !== 409) {
      console.error('Falha no registro');
      process.exit(2);
    }

    console.log('2) Fazendo login');
    res = await fetch(`${API}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const login = await res.json().catch(() => ({}));
    console.log('  Login status:', res.status, login);
    if (!login.token) { console.error('Login falhou'); process.exit(3); }
    const token = login.token;

    console.log('3) Listando talhões (deve estar vazio)');
    res = await fetch(`${API}/talhoes`, { headers: { Authorization: `Bearer ${token}` } });
    const list1 = await res.json().catch(() => []);
    console.log('  GET /talhoes ->', res.status, Array.isArray(list1) ? `count=${list1.length}` : list1);

    console.log('4) Criando talhão de teste');
    const talhaoPayload = {
      nome: 'IT Test Talhão',
      area: 1.23,
      status: 'baixo',
      centerLat: -22.028,
      centerLng: -50.044,
      boundaryJson: [[-22.028, -50.044], [-22.0281, -50.044], [-22.0281, -50.0439], [-22.028, -50.0439]],
      pragasJson: []
    };

    res = await fetch(`${API}/talhoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(talhaoPayload)
    });
    const created = await res.json().catch(() => ({}));
    console.log('  POST /talhoes ->', res.status, created);
    if (res.status !== 201) { console.error('Falha ao criar talhão'); process.exit(4); }

    console.log('5) Listando talhões novamente');
    res = await fetch(`${API}/talhoes`, { headers: { Authorization: `Bearer ${token}` } });
    const list2 = await res.json().catch(() => []);
    console.log('  GET /talhoes ->', res.status, Array.isArray(list2) ? `count=${list2.length}` : list2);
    if (!Array.isArray(list2) || list2.length === 0) { console.error('Talhão não aparece na listagem'); process.exit(5); }

    const t = list2.find(x => x.id === created.id) || list2[0];
    console.log('  Verificando center do talhão criado:', t.center);
    if (!t.center) { console.error('Center é null, bug'); process.exit(6); }
    if (t.center.length !== 2) { console.error('Center formato inválido', t.center); process.exit(7); }

    console.log('6) Test completo com sucesso — fluxo cadastro/login/criar talhão OK');
    process.exit(0);
  } catch (err) {
    console.error('ERRO NO TEST:', err);
    process.exit(99);
  }
})();
