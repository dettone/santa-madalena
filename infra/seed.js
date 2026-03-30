#!/usr/bin/env node
// Seed de dados de teste – Comunidade Santa Madalena
require("dotenv").config({ path: ".env.development" });
const { Client } = require("pg");

const members = [
  { nome: "Maria Aparecida Santos",   email: "maria.santos@email.com",     telefone: "(11) 98765-4321", endereco: "Rua das Flores, 45 – Jardim Esperança", ativo: true },
  { nome: "José Carlos Oliveira",     email: "jose.oliveira@email.com",    telefone: "(11) 97654-3210", endereco: "Av. Padre João, 120 – Centro", ativo: true },
  { nome: "Ana Paula Ferreira",       email: "anapaula.ferreira@email.com",telefone: "(11) 96543-2109", endereco: "Rua Santa Madalena, 77 – Vila Nova", ativo: true },
  { nome: "Francisco Lima",           email: "francisco.lima@email.com",   telefone: "(11) 95432-1098", endereco: "Rua São José, 33 – Boa Vista", ativo: true },
  { nome: "Rosangela Matos",          email: "rosangela.matos@email.com",  telefone: "(11) 94321-0987", endereco: "Rua das Acácias, 88 – Jardim Belo", ativo: true },
  { nome: "Antônio Pedro Souza",      email: "antonio.souza@email.com",    telefone: "(11) 93210-9876", endereco: "Av. Principal, 200 – Centro", ativo: true },
  { nome: "Luzia das Graças Costa",   email: null,                         telefone: "(11) 92109-8765", endereco: "Rua Boa Esperança, 12 – Vila Paz", ativo: true },
  { nome: "Paulo Roberto Almeida",    email: "paulo.almeida@email.com",    telefone: "(11) 91098-7654", endereco: "Rua das Palmeiras, 55 – Jardim Sul", ativo: true },
  { nome: "Teresinha Gomes",          email: null,                         telefone: "(11) 90987-6543", endereco: "Rua São Francisco, 90 – Bairro Novo", ativo: true },
  { nome: "Benedito Ramos",           email: "benedito.ramos@email.com",   telefone: "(11) 89876-5432", endereco: "Av. da Igreja, 15 – Centro", ativo: true },
  { nome: "Conceição Pereira",        email: "conceicao.pereira@email.com",telefone: "(11) 88765-4321", endereco: "Rua Nossa Senhora, 66 – Vila Bela", ativo: true },
  { nome: "Geraldo Batista",          email: null,                         telefone: "(11) 87654-3210", endereco: "Rua Primavera, 44 – Jardim Novo", ativo: false },
  { nome: "Valdirene Nunes",          email: "valdirene.nunes@email.com",  telefone: "(11) 86543-2109", endereco: "Rua Manacá, 101 – Bom Retiro", ativo: true },
  { nome: "Sebastião Carvalho",       email: null,                         telefone: "(11) 85432-1098", endereco: "Rua das Magnólias, 23 – Vila Nova", ativo: true },
  { nome: "Iracema Ribeiro",          email: "iracema.ribeiro@email.com",  telefone: "(11) 84321-0987", endereco: "Av. Cruzeiro, 300 – Jardim Central", ativo: true },
];

const avulsos = [
  "Joana D'Arc Mendes",
  "Raimundo Nonato",
  "Cidinha de Souza",
  "Ezequiel Barbosa",
  "Nelci Aparecida",
];

const formas = ["dinheiro", "pix", "transferencia", "cheque"];
const valores = [50, 80, 100, 120, 150, 200, 250, 300];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function gerarDizimos(activeMemberIds, memberNames) {
  const now = new Date();
  const dizimos = [];

  for (let mesesAtras = 11; mesesAtras >= 0; mesesAtras--) {
    const data = new Date(now.getFullYear(), now.getMonth() - mesesAtras, 1);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    // Membros regulares (probabilidade 80%)
    activeMemberIds.forEach((mid, i) => {
      if (Math.random() > 0.8) return;
      const valor = pick(valores) + Math.round((Math.random() - 0.5) * 20);
      dizimos.push({
        member_id: mid,
        nome_contribuinte: memberNames[i],
        valor: Math.max(20, valor),
        mes, ano,
        forma_pagamento: pick(formas),
        observacao: null,
      });
    });

    // Contribuintes avulsos (1-3 por mês)
    const qtd = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < qtd; j++) {
      dizimos.push({
        member_id: null,
        nome_contribuinte: pick(avulsos),
        valor: pick([30, 50, 70, 100]),
        mes, ano,
        forma_pagamento: "dinheiro",
        observacao: "Contribuinte eventual",
      });
    }
  }

  return dizimos;
}

async function seed() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "local_user",
    database: process.env.POSTGRES_DB || "local_db",
    password: process.env.POSTGRES_PASSWORD || "local_password",
    ssl: false,
  });

  await client.connect();
  console.log("\n✠  Conectado ao banco de dados.\n");

  try {
    await client.query("DELETE FROM tithes");
    await client.query("DELETE FROM members");
    console.log("✠  Dados anteriores removidos.");

    // Insere membros
    const memberIds = [];
    const memberNames = [];
    for (const m of members) {
      const res = await client.query(
        `INSERT INTO members (nome, email, telefone, endereco, ativo)
         VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [m.nome, m.email, m.telefone, m.endereco, m.ativo]
      );
      memberIds.push(res.rows[0].id);
      memberNames.push(m.nome);
    }
    console.log(`✠  ${members.length} membros inseridos (${members.filter(m => m.ativo).length} ativos, ${members.filter(m => !m.ativo).length} inativo).`);

    // Membros ativos para associar dízimos
    const activeMemberIds = memberIds.filter((_, i) => members[i].ativo);
    const activeNames = memberNames.filter((_, i) => members[i].ativo);

    const dizimos = gerarDizimos(activeMemberIds, activeNames);

    for (const d of dizimos) {
      await client.query(
        `INSERT INTO tithes (member_id, nome_contribuinte, valor, mes, ano, forma_pagamento, observacao)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [d.member_id, d.nome_contribuinte, d.valor, d.mes, d.ano, d.forma_pagamento, d.observacao]
      );
    }
    console.log(`✠  ${dizimos.length} registros de dízimo inseridos.`);

    // Insere conteúdos de exemplo
    await client.query("DELETE FROM payment_logs");
    await client.query("DELETE FROM payments");
    await client.query("DELETE FROM contents");

    const conteudos = [
      { tipo: "aviso", titulo: "Festa de Santa Maria Madalena – 22 de Julho", corpo: "Celebramos a festa de nossa padroeira com missa solene às 10h, procissão e festa comunitária. Traga sua família para este momento especial de fé e confraternização. A comunidade prepara comidas típicas e atividades para as crianças.", publicado: true, data_pub: "2026-03-30" },
      { tipo: "reflexao", titulo: "\"Vi o Senhor!\" – A fé de Maria Madalena", corpo: "Maria Madalena foi a primeira testemunha da Ressurreição. Sua fé inabalável nos ensina que o encontro pessoal com Cristo transforma nossas vidas. Nesta semana, reservemos um momento de silêncio para ouvir a voz do Senhor em nossos corações.", publicado: true, data_pub: "2026-03-29" },
      { tipo: "evento", titulo: "Retiro Espiritual – Quaresma 2026", corpo: "Retiro de um dia para adultos no Salão Paroquial. Tema: \"Conversão e Misericórdia\". Inscrições abertas na secretaria até sexta-feira. Vagas limitadas. Contribuição voluntária para o café da manhã e almoço comunitário.", publicado: true, data_pub: "2026-03-28" },
      { tipo: "aviso", titulo: "Horário especial da Semana Santa", corpo: "Durante a Semana Santa, as missas terão horários especiais. Consulte a programação completa na secretaria ou pelo telefone da paróquia. Confissões disponíveis de segunda a quarta, das 15h às 17h.", publicado: true, data_pub: "2026-03-27" },
      { tipo: "reflexao", titulo: "O Dízimo como expressão de gratidão", corpo: "\"Trazei todos os dízimos à casa do tesouro\" (Ml 3,10). O dízimo não é apenas uma contribuição financeira, mas um ato de fé e gratidão a Deus por tudo que recebemos. Cada contribuição sustenta a missão evangelizadora da nossa comunidade.", publicado: true, data_pub: "2026-03-26" },
      { tipo: "evento", titulo: "Encontro de Casais – Abril 2026", corpo: "Encontro mensal para casais no próximo sábado, dia 05/04, às 19h no Salão Paroquial. Tema: \"Comunicação e Perdão na Vida Conjugal\". Tragam um prato para compartilhar na ceia fraterna.", publicado: true, data_pub: "2026-03-25" },
      { tipo: "aviso", titulo: "Catequese – Matrículas abertas", corpo: "As matrículas para a catequese de Primeira Eucaristia e Crisma estão abertas. Procure a secretaria paroquial com documentos do candidato. Início das aulas em fevereiro.", publicado: false, data_pub: "2026-04-01" },
    ];

    for (const c of conteudos) {
      await client.query(
        `INSERT INTO contents (tipo, titulo, corpo, publicado, data_publicacao)
         VALUES ($1,$2,$3,$4,$5)`,
        [c.tipo, c.titulo, c.corpo, c.publicado, c.data_pub]
      );
    }
    console.log(`✠  ${conteudos.length} conteúdos inseridos (${conteudos.filter(c => c.publicado).length} publicados).\n`);

    // Relatório resumido
    const totais = await client.query(`
      SELECT mes, ano, COUNT(*) AS qtd, SUM(valor)::numeric AS total
      FROM tithes GROUP BY mes, ano ORDER BY ano, mes
    `);

    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    console.log("📊  Resumo de arrecadação:");
    console.log("─".repeat(52));
    let grandTotal = 0;
    for (const row of totais.rows) {
      const label = `${meses[row.mes - 1]}/${row.ano}`.padEnd(9);
      const qtd   = `${row.qtd} contribuições`.padEnd(19);
      const total = parseFloat(row.total);
      grandTotal += total;
      console.log(`  ${label} │ ${qtd} │ R$ ${total.toFixed(2)}`);
    }
    console.log("─".repeat(52));
    console.log(`  ${"TOTAL".padEnd(9)} │ ${"".padEnd(19)} │ R$ ${grandTotal.toFixed(2)}`);
    console.log("\n✠  Seed concluído com sucesso!");
    console.log("─".repeat(52));
    console.log("  URL:    http://localhost:3000");
    console.log("  Admin:  http://localhost:3000/admin");
    console.log("  Login:  admin  /  Senha: admin123");
    console.log("─".repeat(52) + "\n");

  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error("\n❌ Erro no seed:", err.message);
  process.exit(1);
});
