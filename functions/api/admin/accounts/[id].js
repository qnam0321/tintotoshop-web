import { requireAdmin } from "../../../_shared/access.js";
import { parseAccountRecord } from "../../../_shared/records.js";
import { hasSameOrigin, jsonResponse, readJsonRequest } from "../../../_shared/response.js";

function parseId(value) {
  if (typeof value !== "string" || !/^[1-9]\d{0,8}$/.test(value)) return null;
  return Number(value);
}

export async function onRequestPut(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }
  if (!context.env.DB) return jsonResponse({ error: "Account storage is not configured." }, 503);

  const id = parseId(context.params.id);
  if (!id) return jsonResponse({ error: "Invalid account record." }, 400);

  const parsed = await readJsonRequest(context.request);
  if (parsed.response) return parsed.response;
  const account = parseAccountRecord(parsed.value);
  if (account.error) return jsonResponse({ error: account.error }, 400);

  try {
    const result = await context.env.DB
      .prepare(`
        UPDATE wholesale_accounts
        SET account_number = ?, store_name = ?, contact_name = ?, phone = ?, email = ?,
            address = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        account.value.account_number,
        account.value.store_name,
        account.value.contact_name,
        account.value.phone,
        account.value.email,
        account.value.address,
        account.value.is_active,
        id
      )
      .run();

    if (!result.meta || !Number.isInteger(result.meta.changes)) {
      throw new Error("D1 returned an invalid update result.");
    }
    if (result.meta.changes === 0) return jsonResponse({ error: "Account record was not found." }, 404);
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) {
      return jsonResponse({ error: "That account number already exists." }, 409);
    }
    console.error("Could not update wholesale account.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not update the account. Please try again." }, 500);
  }
}

export async function onRequestDelete(context) {
  const admin = await requireAdmin(context);
  if (admin.response) return admin.response;
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }
  if (!context.env.DB) return jsonResponse({ error: "Account storage is not configured." }, 503);

  const id = parseId(context.params.id);
  if (!id) return jsonResponse({ error: "Invalid account record." }, 400);

  try {
    const result = await context.env.DB
      .prepare("UPDATE wholesale_accounts SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(id)
      .run();
    if (!result.meta || !Number.isInteger(result.meta.changes)) {
      throw new Error("D1 returned an invalid update result.");
    }
    if (result.meta.changes === 0) return jsonResponse({ error: "Account record was not found." }, 404);
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Could not deactivate wholesale account.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not deactivate the account. Please try again." }, 500);
  }
}
