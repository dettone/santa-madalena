import database from "@/infra/database";
import bcrypt from "bcryptjs";

export async function findAdminByUsername(username: string) {
  const result = await database.query({
    text: "SELECT * FROM admin_users WHERE username = $1",
    values: [username],
  });
  return result.rows[0] ?? null;
}

export async function validateAdminPassword(
  username: string,
  password: string,
): Promise<boolean> {
  const admin = await findAdminByUsername(username);
  if (!admin) return false;
  return bcrypt.compare(password, admin.password_hash);
}
