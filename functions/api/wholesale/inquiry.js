import { getFormspreeEndpoint, sendFormspreeForm } from "../../_shared/formspree.js";
import { hasSameOrigin, jsonResponse, readFormFields } from "../../_shared/response.js";

export async function onRequestPost(context) {
  if (!hasSameOrigin(context.request)) {
    return jsonResponse({ error: "Requests must come from this site." }, 403);
  }

  const inquiryEndpoint = getFormspreeEndpoint(context.env.FORMSPREE_INQUIRY_ENDPOINT);
  if (!inquiryEndpoint) {
    return jsonResponse({ error: "Account inquiry delivery is not configured." }, 503);
  }

  let submittedForm;
  try {
    submittedForm = await context.request.formData();
  } catch {
    return jsonResponse({ error: "Submit the inquiry using the provided form." }, 400);
  }

  const parsed = readFormFields(submittedForm, {
    inquiry_name: { maxLength: 256 },
    company_name: { maxLength: 256 },
    phone_number: { maxLength: 64 },
    email: { maxLength: 254 },
    memo: { maxLength: 4000, required: false }
  });
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);

  const values = parsed.values;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return jsonResponse({ error: "Enter a valid email address." }, 400);
  }

  try {
    const response = await sendFormspreeForm(inquiryEndpoint, {
      form_type: "[Account Inquiry]",
      ...values
    });
    if (!response.ok) {
      console.error("Formspree rejected a wholesale account inquiry.", response.status);
      return jsonResponse({ error: "The inquiry could not be delivered. Please try again." }, 502);
    }
    return jsonResponse({ received: true });
  } catch (error) {
    console.error("Could not deliver a wholesale account inquiry.", error instanceof Error ? error.message : "Unknown error");
    return jsonResponse({ error: "The inquiry could not be delivered. Please try again." }, 502);
  }
}
