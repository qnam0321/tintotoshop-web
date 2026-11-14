window.verifyWholesaleAccount = async function (accountNumber) {
  const response = await fetch("/api/accounts/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_number: accountNumber })
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The account verification service returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(result.error || "The account verification service is unavailable.");
  }
  return result.valid === true;
};
