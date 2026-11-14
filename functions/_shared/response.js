export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

export async function readJsonRequest(request, maxBytes = 16384) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { response: jsonResponse({ error: "Send the request as JSON." }, 415) };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return { response: jsonResponse({ error: "Request body is too large." }, 413) };
  }

  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    return { response: jsonResponse({ error: "Request body is too large." }, 413) };
  }

  try {
    const value = JSON.parse(body);
    if (!value || Array.isArray(value) || typeof value !== "object") {
      return { response: jsonResponse({ error: "A JSON object is required." }, 400) };
    }
    return { value };
  } catch {
    return { response: jsonResponse({ error: "Request body contains invalid JSON." }, 400) };
  }
}

export function hasSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
