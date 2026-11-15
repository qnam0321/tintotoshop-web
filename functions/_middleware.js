import { requireWholesaleCustomer } from "./_shared/access.js";

const wholesaleCatalogPaths = new Set([
  "/kbeauty",
  "/kbeauty.html",
  "/m_kbeauty",
  "/m_kbeauty.html"
]);

function isWholesaleProtectedPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return wholesaleCatalogPaths.has(normalizedPath) ||
    normalizedPath === "/product-images.js" ||
    normalizedPath === "/product-details.js" ||
    normalizedPath === "/best-selling-products.js" ||
    normalizedPath.startsWith("/assets/products/");
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!isWholesaleProtectedPath(url.pathname)) return context.next();

  const customer = await requireWholesaleCustomer(context);
  if (customer.response) {
    if (wholesaleCatalogPaths.has(url.pathname.replace(/\/+$/, "")) && [401, 403].includes(customer.response.status)) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: new URL("/wholesale/", url).href,
          "Cache-Control": "private, no-store"
        }
      });
    }
    return customer.response;
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
