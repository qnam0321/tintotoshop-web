export async function findActiveWholesaleAccount(db, accountNumber, email) {
  const conditions = ["account_number = ?", "is_active = 1"];
  const parameters = [accountNumber];
  if (email !== undefined) {
    conditions.push("lower(email) = ?");
    parameters.push(email.trim().toLowerCase());
  }

  return db.prepare(`
    SELECT 1 AS found
    FROM wholesale_accounts
    WHERE ${conditions.join(" AND ")}
    LIMIT 1
  `).bind(...parameters).first();
}
