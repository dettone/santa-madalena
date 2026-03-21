exports.up = (pgm) => {
  pgm.createTable("admin_users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    username: { type: "varchar(60)", notNull: true, unique: true },
    password_hash: { type: "varchar(100)", notNull: true },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("(now() at time zone 'utc')"),
    },
  });

  // Seed default admin: admin / admin123 (bcrypt hash)
  pgm.sql(`
    INSERT INTO admin_users (username, password_hash)
    VALUES ('admin', '$2b$10$LjP3GC.U5B0AZSQBwlvVoO/ozFnPN1o/OE/kszvH3THIaBvII5jVK')
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("admin_users");
};
