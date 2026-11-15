import { normalizeAccountNumber } from "../../_shared/records.js";
import { jsonResponse, readJsonRequest } from "../../_shared/response.js";

export async function onRequestPost(context) {
  const parsed = await readJsonRequest(context.request);
  if (parsed.response) return parsed.response;

  const accountNumber = normalizeAccountNumber(parsed.value.account_number);
  if (!accountNumber) {
    return jsonResponse({ error: "Enter a valid account number." }, 400);
  }

  const masterCode = context.env.MASTER_WHOLESALE_CODE;
  if (masterCode !== undefined) {
    const normalizedMasterCode = normalizeAccountNumber(masterCode);
    if (!normalizedMasterCode) {
      return jsonResponse({ error: "Master account verification is misconfigured." }, 503);
    }
    if (accountNumber === normalizedMasterCode) {
      return jsonResponse({ valid: true });
    }
  }

  if (!context.env.DB) {
    return jsonResponse({ error: "Account verification is not configured." }, 503);
  }

  try {
    const account = await context.env.DB
      .prepare("SELECT 1 AS found FROM wholesale_accounts WHERE account_number = ? AND is_active = 1 LIMIT 1")
      .bind(accountNumber)
      .first();
    return jsonResponse({ valid: Boolean(account) });
  } catch (error) {
    console.error("Wholesale account verification failed.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Account verification is temporarily unavailable." }, 500);
  }
}
