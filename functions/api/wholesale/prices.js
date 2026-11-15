import { findActiveWholesaleAccount } from "../../_shared/wholesale-accounts.js";
import { hasSameOrigin, jsonResponse, readJsonRequest } from "../../_shared/response.js";
import {
  wholesaleDefaultProductPrice,
  wholesalePricesByTitle
} from "../../_shared/wholesale-prices.js";

export async function onRequestPost(context) {
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }
  if (!context.env.DB) return jsonResponse({ error: "Wholesale account storage is not configured." }, 503);

  const parsed = await readJsonRequest(context.request);
  if (parsed.response) return parsed.response;

  const accountNumber = typeof parsed.value.account_number === "string"
    ? parsed.value.account_number.trim()
    : "";
  if (!accountNumber || accountNumber.length > 128) {
    return jsonResponse({ error: "Enter a valid wholesale account number." }, 400);
  }

  try {
    const account = await findActiveWholesaleAccount(context.env.DB, accountNumber);
    if (!account) return jsonResponse({ error: "Account number not recognized." }, 403);

    return jsonResponse({
      prices: wholesalePricesByTitle,
      defaultProductPrice: wholesaleDefaultProductPrice
    });
  } catch (error) {
    console.error("Could not verify the wholesale price account.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not verify the wholesale account. Please try again." }, 500);
  }
}
