import { requireAdmin } from "../../_shared/access.js";
import { parseAccountRecord } from "../../_shared/records.js";
import { hasSameOrigin, jsonResponse, readJsonRequest } from "../../_shared/response.js";

const ACCOUNT_COLUMNS = "id, account_number, store_name, contact_name, phone, email, address, is_active, created_at, updated_at";

export async function onRequestGet(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  if (!context.env.DB) return jsonResponse({ error: "Account storage is not configured." }, 503);

  try {
    const result = await context.env.DB
      .prepare(`SELECT ${ACCOUNT_COLUMNS} FROM wholesale_accounts ORDER BY store_name COLLATE NOCASE`)
      .all();
    if (!Array.isArray(result.results)) throw new Error("D1 returned an invalid account list.");
    return jsonResponse({ accounts: result.results });
  } catch (error) {
    console.error("Could not load wholesale accounts.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not load wholesale accounts." }, 500);
  }
}

export async function onRequestPost(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }
  if (!context.env.DB) return jsonResponse({ error: "Account storage is not configured." }, 503);

  const parsed = await readJsonRequest(context.request);
  if (parsed.response) return parsed.response;
  const account = parseAccountRecord(parsed.value);
  if (account.error) return jsonResponse({ error: account.error }, 400);

  try {
    const result = await context.env.DB
      .prepare(`
        INSERT INTO wholesale_accounts
          (account_number, store_name, contact_name, phone, email, address, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        account.value.account_number,
        account.value.store_name,
        account.value.contact_name,
        account.value.phone,
        account.value.email,
        account.value.address,
        account.value.is_active
      )
      .run();

    if (!result.meta) throw new Error("D1 returned an invalid insert result.");
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) {
      return jsonResponse({ error: "That account number already exists." }, 409);
    }
    console.error("Could not create wholesale account.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not save the account. Please try again." }, 500);
  }
}
