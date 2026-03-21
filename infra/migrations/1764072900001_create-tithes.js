exports.up = (pgm) => {
  pgm.createTable("tithes", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    member_id: {
      type: "uuid",
      references: "members(id)",
      onDelete: "SET NULL",
    },
    nome_contribuinte: { type: "varchar(150)", notNull: true },
    valor: { type: "numeric(10,2)", notNull: true },
    mes: { type: "integer", notNull: true },
    ano: { type: "integer", notNull: true },
    forma_pagamento: {
      type: "varchar(30)",
      notNull: true,
      default: "'dinheiro'",
    },
    observacao: { type: "text" },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });

  pgm.createIndex("tithes", ["mes", "ano"]);
  pgm.createIndex("tithes", "member_id");
};

exports.down = (pgm) => {
  pgm.dropTable("tithes");
};
