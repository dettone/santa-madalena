import "dotenv/config";
import { Client } from "pg";

const members = [
  { nome: "Maria Aparecida Santos", email: "maria.santos@email.com", telefone: "(11) 98765-4321", endereco: "Rua das Flores, 45 – Jardim Esperança", ativo: true },
  { nome: "José Carlos Oliveira", email: "jose.oliveira@email.com", telefone: "(11) 97654-3210", endereco: "Av. Padre João, 120 – Centro", ativo: true },
  { nome: "Ana Paula Ferreira", email: "anapaula.ferreira@email.com", telefone: "(11) 96543-2109", endereco: "Rua Santa Madalena, 77 – Vila Nova", ativo: true },
  { nome: "Francisco Lima", email: "francisco.lima@email.com", telefone: "(11) 95432-1098", endereco: "Rua São José, 33 – Boa Vista", ativo: true },
  { nome: "Rosangela Matos", email: "rosangela.matos@email.com", telefone: "(11) 94321-0987", endereco: "Rua das Acácias, 88 – Jardim Belo", ativo: true },
  { nome: "Antônio Pedro Souza", email: "antonio.souza@email.com", telefone: "(11) 93210-9876", endereco: "Av. Principal, 200 – Centro", ativo: true },
  { nome: "Luzia das Graças Costa", email: null, telefone: "(11) 92109-8765", endereco: "Rua Boa Esperança, 12 – Vila Paz", ativo: true },
  { nome: "Paulo Roberto Almeida", email: "paulo.almeida@email.com", telefone: "(11) 91098-7654", endereco: "Rua das Palmeiras, 55 – Jardim Sul", ativo: true },
  { nome: "Teresinha Gomes", email: null, telefone: "(11) 90987-6543", endereco: "Rua São Francisco, 90 – Bairro Novo", ativo: true },
  { nome: "Benedito Ramos", email: "benedito.ramos@email.com", telefone: "(11) 89876-5432", endereco: "Av. da Igreja, 15 – Centro", ativo: true },
  { nome: "Conceição Pereira", email: "conceicao.pereira@email.com", telefone: "(11) 88765-4321", endereco: "Rua Nossa Senhora, 66 – Vila Bela", ativo: true },
  { nome: "Geraldo Batista", email: null, telefone: "(11) 87654-3210", endereco: "Rua Primavera, 44 – Jardim Novo", ativo: false },
  { nome: "Valdirene Nunes", email: "valdirene.nunes@email.com", telefone: "(11) 86543-2109", endereco: "Rua Manacá, 101 – Bom Retiro", ativo: true },
  { nome: "Sebastião Carvalho", email: null, telefone: "(11) 85432-1098", endereco: "Rua das Magnólias, 23 – Vila Nova", ativo: true },
  { nome: "Iracema Ribeiro", email: "iracema.ribeiro@email.com", telefone: "(11) 84321-0987", endereco: "Av. Cruzeiro, 300 – Jardim Central", ativo: true },
];

// Gera dízimos distribuídos nos últimos 12 meses
function gerarDizimos(memberIds: string[]) {
  const now = new Date();
  const dizimos: {
    member_id: string | null;
    nome_contribuinte: string;
    valor: number;
    mes: number;
    ano: number;
    forma_pagamento: string;
    observacao: string | null;
  }[] = [];

  const formas = ["dinheiro", "pix", "transferencia", "cheque"];

  // Nomes adicionais de contribuintes ocasionais (não cadastrados como membros)
  const avulsos = [
    "Joana D'Arc Mendes",
    "Raimundo Nonato",
    "Cidinha de Souza",
    "Ezequiel Barbosa",
    "Nelci Aparecida",
  ];

  for (let mesesAtras = 11; mesesAtras >= 0; mesesAtras--) {
    const data = new Date(now.getFullYear(), now.getMonth() - mesesAtras, 1);
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();

    // Membros ativos contribuem com frequência variada
    memberIds.forEach((mid, i) => {
      const prob = i < 10 ? 0.8 : 0.4; // primeiros 10 são mais assíduos
      if (Math.random() > prob) return;

      const baseValor = [50, 80, 100, 120, 150, 200, 250, 300][Math.floor(Math.random() * 8)];
      const variacao = (Math.random() - 0.5) * 20;
      const valor = Math.max(20, Math.round((baseValor + variacao) * 100) / 100);

      const member = members[i];
      dizimos.push({
        member_id: mid,
        nome_contribuinte: member.nome,
        valor,
        mes,
        ano,
        forma_pagamento: formas[Math.floor(Math.random() * formas.length)],
        observacao: null,
      });
    });

    // Contribuintes avulsos (1-3 por mês)
    const qtdAvulsos = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < qtdAvulsos; j++) {
      const nome = avulsos[Math.floor(Math.random() * avulsos.length)];
      const valor = [30, 50, 70, 100][Math.floor(Math.random() * 4)];
      dizimos.push({
        member_id: null,
        nome_contribuinte: nome,
        valor,
        mes,
        ano,
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
  console.log("✠ Conectado ao banco de dados.");

  try {
    // Limpa dados existentes (mantém admin_users)
    await client.query("DELETE FROM tithes");
    await client.query("DELETE FROM members");
    console.log("✠ Dados anteriores removidos.");

    // Insere membros
    const memberIds: string[] = [];
    for (const m of members) {
      const res = await client.query(
        `INSERT INTO members (nome, email, telefone, endereco, ativo)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [m.nome, m.email, m.telefone, m.endereco, m.ativo],
      );
      memberIds.push(res.rows[0].id);
    }
    console.log(`✠ ${members.length} membros inseridos.`);

    // Gera e insere dízimos
    // Usa apenas IDs de membros ativos
    const activeMemberIds = memberIds.filter((_, i) => members[i].ativo) as string[];
    const dizimos = gerarDizimos(activeMemberIds);

    for (const d of dizimos) {
      await client.query(
        `INSERT INTO tithes (member_id, nome_contribuinte, valor, mes, ano, forma_pagamento, observacao)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [d.member_id, d.nome_contribuinte, d.valor, d.mes, d.ano, d.forma_pagamento, d.observacao],
      );
    }
    console.log(`✠ ${dizimos.length} registros de dízimo inseridos.`);

    // Relatório resumido
    const totais = await client.query(`
      SELECT mes, ano, COUNT(*) AS qtd, SUM(valor)::numeric AS total
      FROM tithes
      GROUP BY mes, ano
      ORDER BY ano, mes
    `);

    console.log("\n📊 Resumo por mês:");
    console.log("─".repeat(45));
    const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    for (const row of totais.rows) {
      const label = `${meses[row.mes - 1]}/${row.ano}`.padEnd(10);
      const qtd = `${row.qtd} contribuições`.padEnd(20);
      const total = `R$ ${parseFloat(row.total).toFixed(2)}`;
      console.log(`  ${label} │ ${qtd} │ ${total}`);
    }
    console.log("─".repeat(45));
    console.log("\n✠ Seed concluído com sucesso!\n");
    console.log("  Acesso admin: http://localhost:3000/admin");
    console.log("  Usuário: admin  │  Senha: admin123\n");

  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
