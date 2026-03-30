exports.up = (pgm) => {
  pgm.createTable("payment_logs", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },
    payment_id: {
      type: "uuid",
      notNull: true,
      references: "payments",
      onDelete: "CASCADE",
    },
    evento: {
      type: "varchar(100)",
      notNull: true,
    },
    payload: {
      type: "jsonb",
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });

  pgm.createIndex("payment_logs", ["payment_id"], {
    name: "payment_logs_payment_id_index",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("payment_logs");
};
