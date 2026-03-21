exports.up = (pgm) => {
  pgm.createTable("members", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    nome: { type: "varchar(150)", notNull: true },
    email: { type: "varchar(254)", unique: true },
    telefone: { type: "varchar(20)" },
    endereco: { type: "text" },
    ativo: { type: "boolean", notNull: true, default: true },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("members");
};
