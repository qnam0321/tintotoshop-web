import { requireWholesaleCustomer } from "../../_shared/access.js";
import { hasSameOrigin, jsonResponse, readJsonRequest } from "../../_shared/response.js";

export async function onRequestPost(context) {
  const customer = await requireWholesaleCustomer(context);
  if (customer.response) return customer.response;
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }

  const parsed = await readJsonRequest(context.request);
  if (parsed.response) return parsed.response;

  const accountNumber = typeof parsed.value.account_number === "string"
    ? parsed.value.account_number.trim()
    : "";
  if (!accountNumber || accountNumber.length > 128) {
    return jsonResponse({ error: "Enter a valid wholesale account number." }, 400);
  }

  try {
    const account = await context.env.DB
      .prepare(`
        SELECT 1 AS found
        FROM wholesale_accounts
        WHERE lower(email) = ? AND account_number = ? AND is_active = 1
        LIMIT 1
      `)
      .bind(customer.email, accountNumber)
      .first();
    return jsonResponse({ valid: Boolean(account) });
  } catch (error) {
    console.error("Could not verify the wholesale account.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not verify the wholesale account. Please try again." }, 500);
  }
}
