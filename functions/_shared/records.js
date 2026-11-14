function cleanText(value, maxLength) {
  if (value === undefined) return "";
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length <= maxLength ? text : null;
}

export function normalizeAccountNumber(value) {
  if (typeof value !== "string") return "";
  const accountNumber = value.trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9._-]{0,49}$/.test(accountNumber) ? accountNumber : "";
}

export function parseAccountRecord(input) {
  if (input.is_active !== undefined && typeof input.is_active !== "boolean") {
    return { error: "Account status must be active or inactive." };
  }

  const accountNumber = normalizeAccountNumber(input.account_number);
  const storeName = cleanText(input.store_name, 120);
  const contactName = cleanText(input.contact_name, 120);
  const phone = cleanText(input.phone, 40);
  const email = cleanText(input.email, 254);
  const address = cleanText(input.address, 500);

  if (!accountNumber) {
    return { error: "Enter a valid account number using letters, numbers, periods, underscores, or hyphens." };
  }
  if (!storeName) {
    return { error: "Store name is required and must be 120 characters or fewer." };
  }
  if (contactName === null || phone === null || email === null || address === null) {
    return { error: "One or more store information fields exceed their maximum length." };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  return {
    value: {
      account_number: accountNumber,
      store_name: storeName,
      contact_name: contactName,
      phone,
      email,
      address,
      is_active: input.is_active === false ? 0 : 1
    }
  };
}
