exports.up = (pgm) => {
  pgm.createTable("payments", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },
    stripe_session_id: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },
    stripe_payment_intent: {
      type: "varchar(255)",
    },
    nome_contribuinte: {
      type: "varchar(150)",
      notNull: true,
    },
    email: {
      type: "varchar(254)",
    },
    valor: {
      type: "numeric(10,2)",
      notNull: true,
    },
    metodo: {
      type: "varchar(20)",
      notNull: true,
    },
    status: {
      type: "varchar(30)",
      notNull: true,
      default: "'pendente'",
    },
    tithe_id: {
      type: "uuid",
      references: "tithes",
      onDelete: "SET NULL",
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });

  pgm.createIndex("payments", ["status"], {
    name: "payments_status_index",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("payments");
};
