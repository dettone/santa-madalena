import Link from "next/link";

const MASSES = [
  { dia: "Segunda a Sexta", horario: "07h00", local: "Igreja Principal" },
  { dia: "Sábado", horario: "08h00 e 18h30", local: "Igreja Principal" },
  { dia: "Domingo", horario: "08h00, 10h00 e 18h30", local: "Igreja Principal" },
];

const GROUPS = [
  { nome: "Grupo de Oração", dia: "Terças, 19h30" },
  { nome: "Catequese Infantil", dia: "Sábados, 09h00" },
  { nome: "Coral Paroquial", dia: "Quintas, 19h00" },
  { nome: "Pastoral da Família", dia: "1° Sábado, 10h00" },
];

const NOTICIAS = [
  {
    titulo: "Festa de Santa Maria Madalena",
    data: "22 de julho",
    texto: "Celebramos a festa de nossa padroeira com missas solenes, procissão e festa comunitária. Venha participar!",
  },
  {
    titulo: "Campanha do Dízimo 2024",
    data: "Durante todo o ano",
    texto: "Sua contribuição sustenta as obras da paróquia, mantém os ministérios e ajuda as famílias em vulnerabilidade.",
  },
  {
    titulo: "Retiro Espiritual",
    data: "Próximo sábado",
    texto: "Retiro de um dia para adultos. Inscrições abertas na secretaria paroquial até quinta-feira.",
  },
];

export default function HomePage() {
  return (
    <div style={{ backgroundColor: "var(--cream)", minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: "linear-gradient(180deg, var(--burgundy-dark) 0%, var(--burgundy) 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ color: "var(--gold)", fontSize: "1.75rem" }}>✠</span>
            <div>
              <h1 className="text-white font-bold text-xl leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                Comunidade Santa Madalena
              </h1>
              <p className="text-xs" style={{ color: "var(--gold-light)", fontFamily: "sans-serif" }}>
                Paróquia Santa Maria Madalena
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs px-3 py-1.5 rounded-md transition-all"
            style={{
              backgroundColor: "rgba(201,168,76,0.2)",
              color: "var(--gold-light)",
              border: "1px solid rgba(201,168,76,0.4)",
              fontFamily: "sans-serif",
            }}
          >
            Área Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, var(--burgundy) 0%, var(--burgundy-dark) 60%, #2a0a14 100%)", padding: "5rem 1.5rem", textAlign: "center" }}>
        <div className="max-w-3xl mx-auto">
          <div style={{ fontSize: "4rem", color: "var(--gold)", marginBottom: "1rem" }}>✠</div>
          <h2 className="text-white font-bold mb-4" style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", lineHeight: 1.2 }}>
            Bem-vindo à nossa comunidade
          </h2>
          <p className="mb-8 text-lg" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif" }}>
            Unidos pela fé, fortalecidos pela esperança e movidos pela caridade.
            <br />A Comunidade Santa Madalena é um lugar de encontro com Deus e com o próximo.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#horarios" className="px-6 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: "var(--gold)", color: "var(--brown)", fontFamily: "sans-serif" }}>
              Ver Horários das Missas
            </a>
            <a href="#dizimo" className="px-6 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: "transparent", color: "var(--gold-light)", border: "1px solid var(--gold)", fontFamily: "sans-serif" }}>
              Contribuir com o Dízimo
            </a>
          </div>
        </div>
      </section>

      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--burgundy), var(--gold), var(--burgundy))" }} />

      {/* Notícias */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center font-bold mb-2" style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", color: "var(--burgundy)" }}>
          Avisos e Notícias
        </h2>
        <p className="text-center mb-10 text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>
          Fique por dentro do que acontece em nossa comunidade
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {NOTICIAS.map((n) => (
            <div key={n.titulo} className="rounded-xl p-6 flex flex-col gap-3" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)", boxShadow: "0 2px 8px rgba(107,26,42,0.06)" }}>
              <span className="text-xs font-semibold px-2 py-1 rounded self-start" style={{ backgroundColor: "rgba(201,168,76,0.15)", color: "var(--gold-dark)", fontFamily: "sans-serif" }}>
                {n.data}
              </span>
              <h3 className="font-bold" style={{ fontFamily: "Georgia, serif", color: "var(--burgundy)" }}>
                {n.titulo}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)", fontFamily: "sans-serif", lineHeight: 1.6 }}>
                {n.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Horários */}
      <section id="horarios" style={{ backgroundColor: "var(--cream-dark)", padding: "4rem 1.5rem" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center font-bold mb-10" style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", color: "var(--burgundy)" }}>
            ✠ Horários das Missas
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {MASSES.map((m) => (
              <div key={m.dia} className="rounded-xl p-6 text-center" style={{ backgroundColor: "#fff", border: "2px solid var(--cream-dark)" }}>
                <div className="font-bold mb-2" style={{ color: "var(--burgundy)", fontFamily: "Georgia, serif" }}>{m.dia}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: "var(--gold-dark)", fontFamily: "sans-serif" }}>{m.horario}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>{m.local}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grupos */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-center font-bold mb-10" style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", color: "var(--burgundy)" }}>
          Grupos e Pastorais
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {GROUPS.map((g) => (
            <div key={g.nome} className="rounded-xl p-5 text-center flex flex-col gap-2" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
              <div className="text-3xl mb-1" style={{ color: "var(--gold)" }}>✠</div>
              <div className="font-bold text-sm" style={{ color: "var(--burgundy)", fontFamily: "Georgia, serif" }}>{g.nome}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>{g.dia}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Dízimo */}
      <section id="dizimo" style={{ background: "linear-gradient(135deg, var(--burgundy-dark), var(--burgundy))", padding: "4rem 1.5rem" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div style={{ fontSize: "3rem", color: "var(--gold)", marginBottom: "1rem" }}>💛</div>
          <h2 className="font-bold mb-4" style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", color: "#fff" }}>
            O Dízimo é um ato de fé
          </h2>
          <p className="mb-6" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif", lineHeight: 1.7 }}>
            &ldquo;Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa&rdquo; (Malaquias 3:10).
            Sua contribuição sustenta a missão da nossa comunidade.
          </p>
          <div className="rounded-xl p-6 text-left mb-6" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <h3 className="font-bold mb-3" style={{ color: "var(--gold-light)", fontFamily: "Georgia, serif" }}>Como contribuir:</h3>
            <ul className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif" }}>
              <li>• <strong>Na missa:</strong> Coleta durante a celebração</li>
              <li>• <strong>Secretaria:</strong> Seg a Sex, 09h–17h</li>
              <li>• <strong>PIX:</strong> pix@santamadalena.org.br</li>
              <li>• <strong>Transferência:</strong> Banco do Brasil – Ag. 1234-5 / CC. 12345-6</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-center font-bold mb-10" style={{ fontFamily: "Georgia, serif", fontSize: "1.75rem", color: "var(--burgundy)" }}>
          Fale Conosco
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: "📍", titulo: "Endereço", info: "Rua Santa Madalena, 123\nBairro da Paz" },
            { icon: "📞", titulo: "Telefone", info: "(00) 1234-5678\nSeg a Sex, 09h–17h" },
            { icon: "✉️", titulo: "E-mail", info: "contato@santamadalena.org.br" },
          ].map((c) => (
            <div key={c.titulo} className="rounded-xl p-6 text-center" style={{ backgroundColor: "#fff", border: "1px solid var(--cream-dark)" }}>
              <div className="text-3xl mb-3">{c.icon}</div>
              <div className="font-bold mb-2" style={{ color: "var(--burgundy)", fontFamily: "Georgia, serif" }}>{c.titulo}</div>
              <p className="text-sm whitespace-pre-line" style={{ color: "var(--text-muted)", fontFamily: "sans-serif" }}>{c.info}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "var(--burgundy-dark)", padding: "2rem 1.5rem", textAlign: "center" }}>
        <div style={{ color: "var(--gold)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>✠</div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif" }}>
          © {new Date().getFullYear()} Comunidade Santa Madalena – Todos os direitos reservados.
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "sans-serif" }}>
          &ldquo;Amai-vos uns aos outros como eu vos amei&rdquo; (Jo 13,34)
        </p>
      </footer>
    </div>
  );
}
