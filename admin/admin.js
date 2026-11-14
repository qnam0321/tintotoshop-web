const accountForm = document.getElementById("account-form");
const accountList = document.getElementById("account-list");
const statusMessage = document.getElementById("status");
const saveButton = document.getElementById("save-button");

function setStatus(message, state) {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state || "";
}

async function requestJson(url, options) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options && options.headers ? options.headers : {})
    }
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Check Cloudflare Access and API setup.");
  }
  if (!response.ok) throw new Error(result.error || "The request could not be completed.");
  return result;
}

function makeCell(value, className) {
  const cell = document.createElement("td");
  cell.textContent = value || "—";
  if (className) cell.className = className;
  return cell;
}

function renderAccounts(accounts) {
  accountList.replaceChildren();
  if (!accounts.length) {
    const row = document.createElement("tr");
    const cell = makeCell("No wholesale accounts have been added.", "empty");
    cell.colSpan = 7;
    row.append(cell);
    accountList.append(row);
    return;
  }

  accounts.forEach(account => {
    const row = document.createElement("tr");
    if (!account.is_active) row.className = "inactive";
    row.append(
      makeCell(account.account_number),
      makeCell(account.store_name),
      makeCell(account.contact_name),
      makeCell(account.phone),
      makeCell(account.email),
      makeCell(account.is_active ? "Active" : "Inactive")
    );

    const controls = document.createElement("td");
    controls.className = "controls";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "small";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editAccount(account));
    controls.append(editButton);

    const stateButton = document.createElement("button");
    stateButton.type = "button";
    stateButton.className = "small secondary";
    stateButton.textContent = account.is_active ? "Deactivate" : "Reactivate";
    stateButton.style.marginLeft = "6px";
    stateButton.addEventListener("click", () => changeAccountState(account));
    controls.append(stateButton);

    row.append(controls);
    accountList.append(row);
  });
}

async function loadAccounts() {
  accountList.innerHTML = '<tr><td class="empty" colspan="7">Loading accounts…</td></tr>';
  try {
    const result = await requestJson("/api/admin/accounts");
    if (!Array.isArray(result.accounts)) throw new Error("The server returned an invalid account list.");
    renderAccounts(result.accounts);
    setStatus("", "");
    return true;
  } catch (error) {
    accountList.innerHTML = '<tr><td class="empty" colspan="7">Account list could not be loaded.</td></tr>';
    setStatus(error.message, "error");
    return false;
  }
}

function editAccount(account) {
  document.getElementById("account-id").value = account.id;
  document.getElementById("account-number").value = account.account_number;
  document.getElementById("store-name").value = account.store_name;
  document.getElementById("contact-name").value = account.contact_name || "";
  document.getElementById("phone").value = account.phone || "";
  document.getElementById("email").value = account.email || "";
  document.getElementById("address").value = account.address || "";
  document.getElementById("is-active").checked = Boolean(account.is_active);
  document.getElementById("form-title").textContent = "Edit wholesale account";
  saveButton.textContent = "Save changes";
  setStatus("", "");
  document.getElementById("account-number").focus();
}

function clearForm() {
  accountForm.reset();
  document.getElementById("account-id").value = "";
  document.getElementById("is-active").checked = true;
  document.getElementById("form-title").textContent = "Add wholesale account";
  saveButton.textContent = "Add account";
  setStatus("", "");
}

function formRecord() {
  return {
    account_number: document.getElementById("account-number").value,
    store_name: document.getElementById("store-name").value,
    contact_name: document.getElementById("contact-name").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    address: document.getElementById("address").value,
    is_active: document.getElementById("is-active").checked
  };
}

accountForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!accountForm.reportValidity()) return;

  const id = document.getElementById("account-id").value;
  const url = id ? `/api/admin/accounts/${encodeURIComponent(id)}` : "/api/admin/accounts";
  saveButton.disabled = true;
  try {
    await requestJson(url, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formRecord())
    });
    clearForm();
    if (await loadAccounts()) {
      setStatus(id ? "Account updated." : "Account added.", "success");
    }
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    saveButton.disabled = false;
  }
});

async function changeAccountState(account) {
  if (account.is_active && !window.confirm(`Deactivate ${account.account_number}?`)) return;
  const updatedAccount = {
    account_number: account.account_number,
    store_name: account.store_name,
    contact_name: account.contact_name || "",
    phone: account.phone || "",
    email: account.email || "",
    address: account.address || "",
    is_active: !account.is_active
  };

  try {
    if (account.is_active) {
      await requestJson(`/api/admin/accounts/${encodeURIComponent(account.id)}`, { method: "DELETE" });
    } else {
      await requestJson(`/api/admin/accounts/${encodeURIComponent(account.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAccount)
      });
    }
    if (await loadAccounts()) {
      setStatus(account.is_active ? "Account deactivated." : "Account reactivated.", "success");
    }
  } catch (error) {
    setStatus(error.message, "error");
  }
}

document.getElementById("cancel-button").addEventListener("click", clearForm);
loadAccounts();
