async function postAccountRequest(endpoint, accountNumber, email) {
  const body = { account_number: accountNumber };
  if (email) body.email = email;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The account verification service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(result.error || "The wholesale account service is unavailable.");
  }
  return result;
}

window.verifyWholesaleAccount = async function (accountNumber, email) {
  const result = await postAccountRequest("/api/accounts/verify", accountNumber, email);
  return result.valid === true;
};

window.fetchWholesalePrices = async function (accountNumber) {
  const result = await postAccountRequest("/api/wholesale/prices", accountNumber);
  if (!result.prices || typeof result.prices !== "object") {
    throw new Error("The wholesale price service returned invalid catalog data.");
  }
  return result;
};
