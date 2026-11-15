import { jsonResponse } from "./response.js";

const ACCESS_KEYS_CACHE_MS = 5 * 60 * 1000;
let cachedTeamDomain = "";
let cachedKeys = [];
let cachedKeysAt = 0;

function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Invalid JWT encoding.");
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function decodeJsonSegment(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}

function configurationError(message) {
  return { response: jsonResponse({ error: message }, 503) };
}

async function getAccessKeys(teamDomain, forceRefresh = false) {
  if (
    !forceRefresh &&
    cachedTeamDomain === teamDomain &&
    cachedKeys.length > 0 &&
    Date.now() - cachedKeysAt < ACCESS_KEYS_CACHE_MS
  ) {
    return cachedKeys;
  }

  const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("Could not retrieve Access signing keys.");

  const keySet = await response.json();
  if (!Array.isArray(keySet.keys)) throw new Error("Access signing keys response is invalid.");

  cachedTeamDomain = teamDomain;
  cachedKeys = keySet.keys;
  cachedKeysAt = Date.now();
  return cachedKeys;
}

async function requireAccessIdentity(context, audienceVariable, configurationMessage, signInMessage) {
  const rawTeamDomain = context.env.ACCESS_TEAM_DOMAIN;
  const audiences = (context.env[audienceVariable] || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  if (!rawTeamDomain || audiences.length === 0) return configurationError(configurationMessage);

  let teamDomain;
  try {
    const domainUrl = new URL(rawTeamDomain);
    if (
      domainUrl.protocol !== "https:" ||
      !domainUrl.hostname.endsWith(".cloudflareaccess.com") ||
      domainUrl.pathname !== "/" ||
      domainUrl.search ||
      domainUrl.hash
    ) {
      return configurationError(configurationMessage);
    }
    teamDomain = domainUrl.origin;
  } catch {
    return configurationError(configurationMessage);
  }

  const token = context.request.headers.get("cf-access-jwt-assertion");
  if (!token) return { response: jsonResponse({ error: signInMessage }, 401) };

  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Malformed Access token.");

    const header = decodeJsonSegment(parts[0]);
    const payload = decodeJsonSegment(parts[1]);
    if (header.alg !== "RS256" || typeof header.kid !== "string") {
      throw new Error("Unsupported Access token signature.");
    }

    let keys = await getAccessKeys(teamDomain);
    let signingKey = keys.find(key =>
      key.kid === header.kid &&
      key.kty === "RSA" &&
      (key.alg === undefined || key.alg === "RS256") &&
      (key.use === undefined || key.use === "sig")
    );
    if (!signingKey) {
      keys = await getAccessKeys(teamDomain, true);
      signingKey = keys.find(key =>
        key.kid === header.kid &&
        key.kty === "RSA" &&
        (key.alg === undefined || key.alg === "RS256") &&
        (key.use === undefined || key.use === "sig")
      );
    }
    if (!signingKey) throw new Error("Access signing key was not found.");

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      signingKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signedContent = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signatureIsValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      decodeBase64Url(parts[2]),
      signedContent
    );
    if (!signatureIsValid) throw new Error("Access token signature is invalid.");

    const now = Math.floor(Date.now() / 1000);
    const tokenAudiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (
      payload.iss !== teamDomain ||
      !tokenAudiences.some(audience => audiences.includes(audience)) ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now ||
      (Number.isFinite(payload.nbf) && payload.nbf > now) ||
      (Number.isFinite(payload.iat) && payload.iat > now + 60)
    ) {
      throw new Error("Access token claims are invalid.");
    }

    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email) throw new Error("Access token has no email identity.");
    return { email };
  } catch (error) {
    console.error("Cloudflare Access validation failed.", error instanceof Error ? error.message : "Unknown error");
    return { response: jsonResponse({ error: "Access could not be verified." }, 401) };
  }
}

export async function requireAdmin(context) {
  const allowedEmails = (context.env.ADMIN_EMAILS || "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
  if (allowedEmails.length === 0) return configurationError("Admin access is not configured.");

  const identity = await requireAccessIdentity(
    context,
    "ACCESS_AUDS",
    "Admin access is not configured.",
    "Administrator sign-in is required."
  );
  if (identity.response) return identity;
  if (!allowedEmails.includes(identity.email)) {
    return { response: jsonResponse({ error: "This account is not authorized to manage wholesale accounts." }, 403) };
  }
  return identity;
}
