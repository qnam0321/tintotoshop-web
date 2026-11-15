export function getFormspreeEndpoint(rawEndpoint) {
  if (!rawEndpoint) return null;

  try {
    const endpoint = new URL(rawEndpoint);
    if (
      endpoint.protocol !== "https:" ||
      endpoint.hostname !== "formspree.io" ||
      endpoint.username ||
      endpoint.password ||
      endpoint.port ||
      !/^\/f\/[A-Za-z0-9]+$/.test(endpoint.pathname) ||
      endpoint.search ||
      endpoint.hash
    ) {
      return null;
    }
    return endpoint.href;
  } catch {
    return null;
  }
}

export async function sendFormspreeForm(endpoint, fields) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return fetch(endpoint, {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData
  });
}
