exports.up = (pgm) => {
  pgm.createTable("contents", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
      primaryKey: true,
    },
    tipo: {
      type: "varchar(20)",
      notNull: true,
    },
    titulo: {
      type: "varchar(200)",
      notNull: true,
    },
    corpo: {
      type: "text",
      notNull: true,
    },
    imagem_url: {
      type: "text",
    },
    publicado: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    data_publicacao: {
      type: "date",
      notNull: true,
    },
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

  pgm.createIndex("contents", ["data_publicacao"], {
    name: "contents_data_publicacao_index",
    where: "publicado = true",
  });
};

exports.down = (pgm) => {
  pgm.dropTable("contents");
};
