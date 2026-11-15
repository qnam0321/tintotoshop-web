import { requireWholesaleCustomer } from "../../_shared/access.js";
import { hasSameOrigin, jsonResponse, readFormFields } from "../../_shared/response.js";
import { getFormspreeEndpoint, sendFormspreeForm } from "../../_shared/formspree.js";

export async function onRequestPost(context) {
  const customer = await requireWholesaleCustomer(context);
  if (customer.response) return customer.response;
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
    order_details: { maxLength: 100000 },
    grand_total: { maxLength: 32 },
    memo: { maxLength: 4000, required: false }
  });
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);

  const values = parsed.values;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ||
    values.email.toLowerCase() !== customer.email
  ) {
    return jsonResponse({ error: "Use the email address linked to your wholesale account." }, 400);
  }
  if (!/^\$\d+(?:\.\d{2})?$/.test(values.grand_total)) {
    return jsonResponse({ error: "The order total is invalid." }, 400);
  }

  try {
    const account = await context.env.DB
      .prepare(`
        SELECT 1 AS found
        FROM wholesale_accounts
        WHERE lower(email) = ? AND account_number = ? AND is_active = 1
        LIMIT 1
      `)
      .bind(customer.email, values.account_number)
      .first();
    if (!account) {
      return jsonResponse({ error: "The account number is not linked to this wholesale account." }, 403);
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
      email: customer.email,
      order_details: values.order_details,
      grand_total: values.grand_total,
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
