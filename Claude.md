# Documentação do Sistema - Santa Madalena

Este arquivo serve como guia sobre a arquitetura, regras de negócio e tecnologias do projeto "Santa Madalena".

## 1. Visão Geral

Sistema web para a **Comunidade Santa Maria Madalena** (Igreja Católica), com duas áreas:

- **Página pública** (`/`): informações da comunidade — horários de missas, grupos pastorais, conteúdos diários (avisos, reflexões, eventos), seção de dízimo com pagamento online (PIX/cartão) e contato.
- **Área administrativa** (`/admin`): login protegido por JWT, gestão de membros, dízimos, conteúdos diários, dashboard com gráficos/relatórios mensais, e exportação de relatórios em PDF/Excel.

## 2. Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 + CSS custom properties |
| Banco de Dados | PostgreSQL 16 (via pacote `pg`) |
| Migrations | `node-pg-migrate` |
| Autenticação | JWT (`jose`) + cookies HttpOnly + `bcryptjs` |
| Gráficos | Recharts |
| Data fetching (client) | SWR |
| Pagamentos | Stripe (Checkout Sessions — PIX e Cartão) |
| Mensageria | Apache Kafka (`kafkajs`) — processamento assíncrono de webhooks de pagamento |
| Relatórios | `pdfkit` (PDF) + `exceljs` (Excel) |

## 3. Estrutura de Pastas

```
app/
├── page.tsx                     # Página pública da comunidade (conteúdos dinâmicos)
├── layout.tsx                   # Root layout (CSS variables do tema)
├── globals.css                  # Tailwind + custom properties
├── admin/
│   ├── page.tsx                 # Login administrativo
│   ├── dashboard/page.tsx       # Dashboard com gráficos e estatísticas
│   ├── dizimo/page.tsx          # CRUD de dízimos
│   ├── membros/page.tsx         # CRUD de membros
│   ├── conteudos/page.tsx       # CRUD de conteúdos diários (avisos, reflexões, eventos)
│   └── relatorios/page.tsx      # Página de geração de relatórios (PDF/Excel)
├── api/
│   ├── auth/login/route.ts      # POST /api/auth/login
│   ├── auth/logout/route.ts     # POST /api/auth/logout
│   ├── conteudos/route.ts       # GET (público), POST (admin)
│   ├── conteudos/[id]/route.ts  # PUT, DELETE (admin)
│   ├── dizimo/route.ts          # GET, POST /api/dizimo
│   ├── dizimo/[id]/route.ts     # PUT, DELETE /api/dizimo/:id
│   ├── membros/route.ts         # GET, POST /api/membros
│   ├── membros/[id]/route.ts    # PUT, DELETE /api/membros/:id
│   ├── pagamentos/
│   │   ├── criar-sessao/route.ts # POST — cria Stripe Checkout Session (PIX ou cartão)
│   │   └── webhook/route.ts      # POST — recebe webhook do Stripe, publica no Kafka
│   ├── relatorios/
│   │   ├── mensal/route.ts       # GET relatório mensal (JSON)
│   │   ├── pdf/route.ts          # GET — gera PDF do relatório
│   │   └── excel/route.ts        # GET — gera Excel do relatório
│   └── status/route.ts          # GET status do banco
├── components/
│   ├── AdminSidebar.tsx         # Menu lateral do admin
│   └── StatCard.tsx             # Card de estatística reutilizável
infra/
├── database.ts                  # Client PostgreSQL (query + getNewClient)
├── kafka.ts                     # Produtor e consumidor Kafka (kafkajs)
├── migrations/                  # Migrations (node-pg-migrate)
│   ├── ..._create-users.js
│   ├── ..._create-members.js
│   ├── ..._create-tithes.js
│   ├── ..._create-admin-users.js
│   ├── ..._create-contents.js
│   ├── ..._create-payments.js
│   └── ..._create-payment-logs.js
├── seed.js                      # Script de dados de teste
models/
├── adminUser.ts                 # findAdminByUsername, validateAdminPassword
├── content.ts                   # CRUD de conteúdos diários
├── member.ts                    # CRUD de membros
├── payment.ts                   # Registros de pagamento + logs
├── tithe.ts                     # CRUD de dízimos + getMonthlyTotals + getDashboardStats
├── status.ts                    # Status do banco
├── migrator.ts                  # Runner de migrations
lib/
├── auth.ts                      # createToken, verifyToken, getSession, cookies
├── stripe.ts                    # Cliente Stripe + helpers de checkout
└── reports.ts                   # Geradores de PDF e Excel
workers/
└── paymentConsumer.ts           # Consumer Kafka — processa pagamentos confirmados e grava no banco
middleware.ts                    # Protege rotas /admin/* (exceto /admin login)
```

## 4. Padrões e Diretrizes

### 4.1. Acesso a dados
- **Nunca** fazer queries SQL diretamente nas rotas da API. Toda lógica de dados fica em `models/`.
- O módulo `infra/database.ts` expõe `query({ text, values })` — sempre usar queries parametrizadas.

### 4.2. Autenticação
- Login via `POST /api/auth/login` → gera JWT (HS256, 8h) → cookie `sm_admin_token`.
- `middleware.ts` protege `/admin/dashboard`, `/admin/dizimo`, `/admin/membros`, `/admin/conteudos`, `/admin/relatorios`.
- Credenciais padrão de dev: **admin / admin123**.

### 4.3. Identidade Visual (Tema)
Cores definidas como CSS custom properties em `globals.css`:
- `--burgundy`: `#800020` / `--burgundy-dark`: `#4a0012` (principal)
- `--gold`: `#C9A84C` / `--gold-dark`: `#A8893A` / `--gold-light`: `#D4B85A`
- `--cream`: `#FFF8F0` / `--cream-dark`: `#F0E6D6`
- Tipografia: Georgia (serif) para títulos, sans-serif para corpo.
- Ícone paroquial: ✠ (cruz latina)
- Imagens: usar imagens referentes a Santa Maria Madalena e iconografia católica na página pública (hero, seções). Armazenadas em `public/images/`.

### 4.4. Migrations
- Criar: `npm run migrations:create nome_da_migration`
- Executar: `npm run migrations:up`
- Diretório: `infra/migrations/`

### 4.5. Componentes
- Componentes compartilhados ficam em `app/components/`.
- Páginas admin usam `AdminSidebar` para navegação lateral.
- `StatCard` é o card reutilizável para métricas do dashboard.

### 4.6. Gestão de Conteúdos Diários
- Admin cria/edita/exclui conteúdos em `/admin/conteudos`.
- Tipos de conteúdo: `aviso`, `reflexao`, `evento`.
- Conteúdos com `publicado = true` e `data_publicacao <= hoje` aparecem automaticamente na página pública (`/`).
- A API `GET /api/conteudos` é **pública** (sem autenticação). POST/PUT/DELETE exigem sessão admin.

### 4.7. Pagamentos Online (Stripe)
- O visitante escolhe valor e método (PIX ou cartão) na seção de dízimo da página pública.
- `POST /api/pagamentos/criar-sessao` cria uma Stripe Checkout Session e retorna a URL de redirecionamento.
- Após confirmação, o Stripe envia webhook para `POST /api/pagamentos/webhook`.
- O webhook publica o evento no tópico Kafka `pagamentos-confirmados`.
- O worker `workers/paymentConsumer.ts` consome o tópico, registra o pagamento na tabela `payments` e cria automaticamente o registro de dízimo na tabela `tithes`.
- Variáveis de ambiente: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLIC_KEY`.

### 4.8. Mensageria (Kafka)
- Módulo `infra/kafka.ts` expõe produtor e consumidor via `kafkajs`.
- Tópico principal: `pagamentos-confirmados`.
- O worker consome eventos e persiste pagamentos no banco com tratamento de erros e retries.
- Variáveis de ambiente: `KAFKA_BROKERS` (ex: `localhost:9092`).
- Docker Compose inclui Kafka + Zookeeper para desenvolvimento local.

### 4.9. Relatórios (PDF / Excel)
- Página admin `/admin/relatorios` permite selecionar período e tipo de relatório.
- `GET /api/relatorios/pdf?mes=3&ano=2026` → stream de PDF com resumo de dízimos, membros ativos, totais por forma de pagamento.
- `GET /api/relatorios/excel?mes=3&ano=2026` → download de planilha Excel com dados detalhados.
- Biblioteca PDF: `pdfkit`. Biblioteca Excel: `exceljs`.

## 5. Banco de Dados

### Tabelas

**members**
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| nome | varchar(150) | NOT NULL |
| email | varchar(254) | UNIQUE, nullable |
| telefone | varchar(20) | nullable |
| endereco | text | nullable |
| ativo | boolean | default true |
| created_at / updated_at | timestamptz | auto |

**tithes**
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| member_id | uuid (FK → members) | nullable (contribuintes avulsos) |
| nome_contribuinte | varchar(150) | NOT NULL |
| valor | numeric(10,2) | NOT NULL |
| mes | integer | 1–12 |
| ano | integer | ex: 2026 |
| forma_pagamento | varchar(30) | default 'dinheiro' |
| observacao | text | nullable |
| created_at | timestamptz | auto |

**admin_users**
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| username | varchar(60) | UNIQUE, NOT NULL |
| password_hash | varchar(100) | bcrypt |
| created_at | timestamptz | auto |

**contents** (conteúdos diários)
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| tipo | varchar(20) | NOT NULL — 'aviso', 'reflexao', 'evento' |
| titulo | varchar(200) | NOT NULL |
| corpo | text | NOT NULL |
| imagem_url | text | nullable — URL de imagem opcional |
| publicado | boolean | default false |
| data_publicacao | date | NOT NULL — quando exibir na página pública |
| created_at / updated_at | timestamptz | auto |

**payments** (pagamentos online)
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| stripe_session_id | varchar(255) | UNIQUE, NOT NULL |
| stripe_payment_intent | varchar(255) | nullable |
| nome_contribuinte | varchar(150) | NOT NULL |
| email | varchar(254) | nullable |
| valor | numeric(10,2) | NOT NULL |
| metodo | varchar(20) | 'pix' ou 'cartao' |
| status | varchar(30) | 'pendente', 'confirmado', 'falhou' |
| tithe_id | uuid (FK → tithes) | nullable — preenchido após criar dízimo |
| created_at | timestamptz | auto |

**payment_logs** (logs de eventos de pagamento)
| Coluna | Tipo | Notas |
|---|---|---|
| id | uuid (PK) | gen_random_uuid() |
| payment_id | uuid (FK → payments) | NOT NULL |
| evento | varchar(100) | NOT NULL — ex: 'checkout.session.completed' |
| payload | jsonb | dados crus do webhook |
| created_at | timestamptz | auto |

**users** (legado — tabela inicial, não utilizada pelo sistema de dízimo)

### Índices
- `tithes_mes_ano_index` — (mes, ano)
- `tithes_member_id_index` — (member_id)
- `contents_data_publicacao_index` — (data_publicacao) WHERE publicado = true
- `payments_stripe_session_id_index` — (stripe_session_id) UNIQUE
- `payments_status_index` — (status)
- `payment_logs_payment_id_index` — (payment_id)

## 6. Scripts NPM

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run seed` | Popula banco com dados de teste |
| `npm run migrations:up` | Executa migrations pendentes |
| `npm run migrations:create` | Cria nova migration |
| `npm run worker:payments` | Inicia consumer Kafka de pagamentos |
| `npm test` | Executa testes (Jest) |

## 7. Setup Local

```bash
docker compose up -d        # PostgreSQL + Kafka + Zookeeper
npm install
npm run migrations:up
npm run seed                 # dados de teste
npm run dev                  # http://localhost:3000
npm run worker:payments      # (outro terminal) consumer Kafka
```

Acesso admin: `http://localhost:3000/admin` → **admin / admin123**

### Variáveis de Ambiente (.env.development)
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=local_user
POSTGRES_DB=local_db
POSTGRES_PASSWORD=local_password
DATABASE_URL=postgres://local_user:local_password@localhost:5432/local_db

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

KAFKA_BROKERS=localhost:9092

JWT_SECRET=santa-madalena-secret-key-2024
```
