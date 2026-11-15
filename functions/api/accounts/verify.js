import { jsonResponse } from "../../_shared/response.js";

export async function onRequestPost() {
  return jsonResponse({
    error: "Wholesale customer verification is temporarily unavailable. Request access at info@tintoroshop.com."
  }, 503);
}
