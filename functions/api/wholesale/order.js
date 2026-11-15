import { hasSameOrigin, jsonResponse, readFormFields } from "../../_shared/response.js";
import { getFormspreeEndpoint, sendFormspreeForm } from "../../_shared/formspree.js";
import { findActiveWholesaleAccount } from "../../_shared/wholesale-accounts.js";
import {
  wholesaleDefaultProductPrice,
  wholesalePricesByTitle
} from "../../_shared/wholesale-prices.js";

function getUnitPriceCents(title) {
  const price = wholesalePricesByTitle[title] ||
    (title.endsWith("Signature Product") || title.endsWith(" Product")
      ? wholesaleDefaultProductPrice
      : "");
  const match = /^\$(\d+)\.(\d{2})$/.exec(price);
  return match ? Number(match[1]) * 100 + Number(match[2]) : null;
}

function formatPrice(cents) {
  return `$${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, "0")}`;
}

function calculateOrder(orderItemsText) {
  let items;
  try {
    items = JSON.parse(orderItemsText);
  } catch {
    return { error: "The order items are invalid." };
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > 500) {
    return { error: "Select at least one catalog item." };
  }

  const seenTitles = new Set();
  const details = [];
  let totalCents = 0;
  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      typeof item.title !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100000 ||
      item.title.length > 500 ||
      seenTitles.has(item.title)
    ) {
      return { error: "The order items are invalid." };
    }

    const unitPriceCents = getUnitPriceCents(item.title);
    if (unitPriceCents === null) {
      return { error: "The order contains an item that is not in the catalog." };
    }

    seenTitles.add(item.title);
    const subtotalCents = unitPriceCents * item.quantity;
    totalCents += subtotalCents;
    if (!Number.isSafeInteger(totalCents)) {
      return { error: "The order total is too large." };
    }
    details.push(`[${item.title}] - Qty: ${item.quantity}ea - Subtotal: ${formatPrice(subtotalCents)}`);
  }

  return { orderDetails: details.join("\n"), grandTotal: formatPrice(totalCents) };
}

export async function onRequestPost(context) {
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }
  if (!context.env.DB) return jsonResponse({ error: "Wholesale account storage is not configured." }, 503);

  const orderEndpoint = getFormspreeEndpoint(context.env.FORMSPREE_ORDER_ENDPOINT);
  if (!orderEndpoint) {
    return jsonResponse({ error: "Order request delivery is not configured." }, 503);
  }

  let submittedForm;
  try {
    submittedForm = await context.request.formData();
  } catch {
    return jsonResponse({ error: "Submit the order request using the provided form." }, 400);
  }

  const parsed = readFormFields(submittedForm, {
    account_number: { maxLength: 128 },
    company_name: { maxLength: 256 },
    phone_number: { maxLength: 64 },
    shipping_address: { maxLength: 500 },
    email: { maxLength: 254 },
    order_items: { maxLength: 100000 },
    memo: { maxLength: 4000, required: false }
  });
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);

  const values = parsed.values;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return jsonResponse({ error: "Enter a valid email address." }, 400);
  }
  const calculatedOrder = calculateOrder(values.order_items);
  if (calculatedOrder.error) return jsonResponse({ error: calculatedOrder.error }, 400);

  try {
    const account = await findActiveWholesaleAccount(context.env.DB, values.account_number, values.email);
    if (!account) {
      return jsonResponse({ error: "The account number and email do not match an active wholesale account." }, 403);
    }
  } catch (error) {
    console.error("Could not verify the order account.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "Could not verify the order account. Please try again." }, 500);
  }

  try {
    const response = await sendFormspreeForm(orderEndpoint, {
      form_type: "[Wholesale Order Request]",
      account_number: values.account_number,
      company_name: values.company_name,
      phone_number: values.phone_number,
      shipping_address: values.shipping_address,
      email: values.email.toLowerCase(),
      order_details: calculatedOrder.orderDetails,
      grand_total: calculatedOrder.grandTotal,
      memo: values.memo
    });
    if (!response.ok) {
      console.error("Formspree rejected a wholesale order request.", response.status);
      return jsonResponse({ error: "The order request could not be delivered. Please try again." }, 502);
    }
    return jsonResponse({ received: true });
  } catch (error) {
    console.error("Could not deliver a wholesale order request.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "The order request could not be delivered. Please try again." }, 502);
  }
}
