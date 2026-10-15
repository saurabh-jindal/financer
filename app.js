const STORAGE_KEY = "financer:v1";
const LICENSE_PRICE_USD = 50;

const fallbackCurrencies = [
  "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN",
  "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL",
  "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY",
  "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP",
  "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD",
  "GNF", "GTQ", "GYD", "HKD", "HNL", "HTG", "HUF", "IDR", "ILS", "INR",
  "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF",
  "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL",
  "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR",
  "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR",
  "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR",
  "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD",
  "SHP", "SLE", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS",
  "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD",
  "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XOF", "XPF",
  "YER", "ZAR", "ZMW", "ZWL"
];

const currencyNames = typeof Intl.DisplayNames === "function"
  ? new Intl.DisplayNames(["en"], { type: "currency" })
  : null;

const supportedCurrencies = (() => {
  if (typeof Intl.supportedValuesOf === "function") {
    try {
      return Intl.supportedValuesOf("currency");
    } catch {
      return fallbackCurrencies;
    }
  }
  return fallbackCurrencies;
})();

const icons = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/></svg>',
  transactions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M7 7h10M7 12h10M7 17h6"/><path d="M4 4h16v16H4z"/></svg>',
  categories: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h7v7H4zM13 6h7v7h-7zM4 15h7v3H4zM13 15h7v3h-7z"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  pricing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 7 10 17l-5-5"/><path d="M4 5h16v14H4z"/></svg>'
};

const defaultState = {
  view: "home",
  filter: "all",
  profile: {
    name: "Personal",
    currency: "USD"
  },
  license: {
    active: false,
    purchasedAt: null
  },
  nextCategoryId: 5,
  nextTransactionId: 5,
  categories: [
    { id: 1, name: "Business", kind: "debit" },
    { id: 2, name: "Sales", kind: "credit" },
    { id: 3, name: "Personal", kind: "debit" },
    { id: 4, name: "Interest", kind: "credit" }
  ],
  transactions: [
    {
      id: 1,
      type: "debit",
      amount: 10000,
      merchant: "Raj Traders",
      categoryId: 1,
      date: "2026-10-12",
      note: "Given to merchant",
      interest: { mode: "simple", rate: 2, frequency: "monthly", periods: 6 }
    },
    {
      id: 2,
      type: "credit",
      amount: 5000,
      merchant: "Maya Supplies",
      categoryId: 2,
      date: "2026-10-10",
      note: "Received from merchant",
      interest: { mode: "compound", rate: 1.5, frequency: "monthly", periods: 6 }
    },
    {
      id: 3,
      type: "debit",
      amount: 86.42,
      merchant: "Green Basket",
      categoryId: 3,
      date: "2026-10-09",
      note: "Groceries",
      interest: null
    },
    {
      id: 4,
      type: "credit",
      amount: 3850,
      merchant: "Client payment",
      categoryId: 2,
      date: "2026-10-01",
      note: "Invoice paid",
      interest: null
    }
  ]
};

let state = loadState();
let editingTransactionId = null;
let editingCategoryId = null;

const app = document.querySelector("#app");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(defaultState);
  try {
    return { ...clone(defaultState), ...JSON.parse(saved) };
  } catch {
    return clone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(value, options = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: state.profile.currency,
    maximumFractionDigits: options.round ? 0 : undefined
  }).format(value);
}

function categoryName(id) {
  return state.categories.find((category) => category.id === Number(id))?.name || "Uncategorized";
}

function currencyLabel(code) {
  const name = currencyNames?.of(code);
  return name ? `${code} - ${name}` : code;
}

function totals() {
  const credit = state.transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const debit = state.transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  return { credit, debit, balance: credit - debit };
}

function signedAmount(transaction) {
  return transaction.type === "credit"
    ? money(transaction.amount)
    : `-${money(transaction.amount)}`;
}

function transactionBadge(transaction) {
  if (!transaction.interest) return "";
  return `<span class="badge">${capitalize(transaction.interest.mode)} · ${capitalize(transaction.interest.frequency)}</span>`;
}

function initials(text) {
  return (text || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function capitalize(value) {
  return `${value}`.charAt(0).toUpperCase() + `${value}`.slice(1);
}

function render() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Primary">
        <div class="brand">
          <div class="logo" aria-hidden="true">F</div>
          <div>
            <strong>Financer</strong>
            <div class="small">Simple local ledger</div>
          </div>
        </div>
        <nav class="nav" aria-label="Sections">
          ${navButton("home", "Home")}
          ${navButton("transactions", "Transactions")}
          ${navButton("categories", "Categories")}
          ${navButton("profile", "Profile")}
          ${navButton("pricing", "Pricing")}
        </nav>
        <div class="sidebar-license">
          <div class="row">
            <span class="small">License</span>
            <span class="small ${state.license.active ? "positive" : "negative"}">${state.license.active ? "Active" : "Inactive"}</span>
          </div>
          <div class="small">$${LICENSE_PRICE_USD} USD one-time purchase. Data stays in this browser.</div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <h1>${pageTitle()}</h1>
            <p class="small">${pageSubtitle()}</p>
          </div>
          <div class="actions">
            ${state.view === "pricing" ? "" : '<button type="button" class="primary-btn" data-action="new-transaction">Add transaction</button>'}
          </div>
        </header>
        <section class="content">
          ${renderView()}
        </section>
      </main>
    </div>
    ${renderTransactionModal()}
    ${renderCategoryModal()}
    ${renderDetailModal()}
    <div class="toast" id="toast" hidden role="status"></div>
  `;
}

function navButton(view, label) {
  return `
    <button type="button" data-view="${view}" ${state.view === view ? 'aria-current="page"' : ""}>
      ${icons[view]}
      <span>${label}</span>
    </button>
  `;
}

function pageTitle() {
  return {
    home: "Home",
    transactions: "Transactions",
    categories: "Categories",
    profile: "Profile",
    pricing: "Pricing"
  }[state.view];
}

function pageSubtitle() {
  return {
    home: `Default currency ${state.profile.currency} · License ${state.license.active ? "active" : "not active"}`,
    transactions: "CRUD for credit and debit entries",
    categories: "CRUD for transaction categories",
    profile: "Default currency for all amounts",
    pricing: "One-time license page"
  }[state.view];
}

function renderView() {
  if (state.view === "transactions") return renderTransactionsPage();
  if (state.view === "categories") return renderCategoriesPage();
  if (state.view === "profile") return renderProfilePage();
  if (state.view === "pricing") return renderPricingPage();
  return renderHomePage();
}

function renderHomePage() {
  const summary = totals();
  return `
    <div class="overview">
      <article class="card">
        <div class="stat-label">Balance</div>
        <div class="stat">${money(summary.balance, { round: true })}</div>
      </article>
      <article class="card">
        <div class="stat-label">Credit</div>
        <div class="stat-small positive">${money(summary.credit, { round: true })}</div>
      </article>
      <article class="card">
        <div class="stat-label">Debit</div>
        <div class="stat-small negative">${money(summary.debit, { round: true })}</div>
      </article>
      <article class="card">
        <div class="stat-label">License</div>
        <div class="stat-small ${state.license.active ? "positive" : "negative"}">${state.license.active ? "Active" : "Inactive"}</div>
      </article>
    </div>
    <article class="card">
      <div class="card-head">
        <div>
          <h2>Recent transactions</h2>
          <p class="small">Credit and debit only, in ${state.profile.currency}</p>
        </div>
        <button type="button" class="chip" data-view="transactions">View all</button>
      </div>
      <div class="table">${renderTransactionRows(state.transactions.slice(0, 5), true)}</div>
    </article>
  `;
}

function renderTransactionsPage() {
  const filtered = state.transactions.filter((transaction) => state.filter === "all" || transaction.type === state.filter);
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <h2>Transactions</h2>
          <p class="small">Create, edit, delete, and inspect interest history</p>
        </div>
        <div class="actions" aria-label="Transaction filters">
          <button type="button" class="chip" data-filter="all" aria-pressed="${state.filter === "all"}">All</button>
          <button type="button" class="chip" data-filter="credit" aria-pressed="${state.filter === "credit"}">Credit</button>
          <button type="button" class="chip" data-filter="debit" aria-pressed="${state.filter === "debit"}">Debit</button>
        </div>
      </div>
      <div class="table">${renderTransactionRows(filtered, false)}</div>
    </article>
  `;
}

function renderTransactionRows(transactions, compact) {
  if (!transactions.length) return '<div class="empty-state">No transactions yet.</div>';
  return transactions.map((transaction) => `
    <div class="list-row">
      <div class="avatar" aria-hidden="true">${initials(transaction.merchant)}</div>
      <div class="list-main">
        <strong>${escapeHtml(transaction.merchant)}${transactionBadge(transaction)}</strong>
        <span class="small">${escapeHtml(categoryName(transaction.categoryId))} · ${escapeHtml(transaction.note || transaction.date)}</span>
      </div>
      <div class="actions">
        <div class="money ${transaction.type === "credit" ? "positive" : "negative"}">${signedAmount(transaction)}</div>
        ${compact ? "" : `
          <button type="button" class="ghost-btn" data-action="detail-transaction" data-id="${transaction.id}">Details</button>
          <button type="button" class="ghost-btn" data-action="edit-transaction" data-id="${transaction.id}">Edit</button>
        `}
      </div>
    </div>
  `).join("");
}

function renderCategoriesPage() {
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <h2>Categories</h2>
          <p class="small">Simple category CRUD for transaction organization</p>
        </div>
        <button type="button" class="primary-btn" data-action="new-category">Add category</button>
      </div>
      <div class="table">
        ${state.categories.map((category) => `
          <div class="list-row">
            <div class="avatar" aria-hidden="true">${initials(category.name)}</div>
            <div class="list-main">
              <strong>${escapeHtml(category.name)}</strong>
              <span class="small">${capitalize(category.kind)} category</span>
            </div>
            <button type="button" class="ghost-btn" data-action="edit-category" data-id="${category.id}">Edit</button>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderProfilePage() {
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <h2>Profile</h2>
          <p class="small">All amounts use one selected currency. Existing numbers are not converted.</p>
        </div>
      </div>
      <form class="form-grid" data-form="profile">
        <div class="field">
          <label for="profile-name">Name</label>
          <input id="profile-name" name="name" value="${escapeAttr(state.profile.name)}">
        </div>
        <div class="field">
          <label for="profile-currency">Default currency</label>
          <select id="profile-currency" name="currency">
            ${supportedCurrencies.map((code) => `<option value="${code}" ${state.profile.currency === code ? "selected" : ""}>${escapeHtml(currencyLabel(code))}</option>`).join("")}
          </select>
        </div>
        <div class="row">
          <p class="small">This version supports all currencies available through the browser Intl API, with a broad ISO fallback.</p>
          <button type="submit" class="primary-btn">Save profile</button>
        </div>
      </form>
    </article>
  `;
}

function renderPricingPage() {
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <h2>Pricing</h2>
          <p class="small">One-time license, no subscription</p>
        </div>
      </div>
      <div class="pricing-grid">
        <div class="detail-cell">
          <div class="small">Personal license</div>
          <div class="stat">$${LICENSE_PRICE_USD} USD</div>
          <p class="small">Unlocks this local app for one user.</p>
        </div>
        <div class="detail-cell">
          <div class="small">Includes</div>
          <div class="stat-small">Transactions, categories, profile currency, interest history</div>
          <p class="small">Optional account-based license recovery can be added later.</p>
        </div>
      </div>
      <div class="row">
        <p class="small">${state.license.active ? `Activated ${new Date(state.license.purchasedAt).toLocaleDateString()}` : "Payment is mocked in this local build."}</p>
        <button type="button" class="primary-btn" data-action="buy-license" ${state.license.active ? "disabled" : ""}>${state.license.active ? "License active" : `Pay $${LICENSE_PRICE_USD}`}</button>
      </div>
    </article>
  `;
}

function renderTransactionModal() {
  return `
    <div class="modal" id="transaction-modal" hidden role="dialog" aria-modal="true" aria-labelledby="transaction-title">
      <form class="modal-card" data-form="transaction">
        <div class="card-head">
          <div>
            <h2 id="transaction-title">Add transaction</h2>
            <p class="small">Credit or debit, optional interest terms</p>
          </div>
          <button type="button" class="icon-btn" data-action="close-modal" data-modal="transaction-modal" aria-label="Close">${closeIcon()}</button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="transaction-type">Type</label>
            <select id="transaction-type" name="type">
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div class="field">
            <label for="transaction-amount">Amount</label>
            <input id="transaction-amount" name="amount" value="1000" inputmode="decimal" required>
          </div>
          <div class="field">
            <label for="transaction-merchant">Merchant / person</label>
            <input id="transaction-merchant" name="merchant" value="Raj Traders" required>
          </div>
          <div class="field">
            <label for="transaction-category">Category</label>
            <select id="transaction-category" name="categoryId">
              ${state.categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join("")}
            </select>
          </div>
          <div class="field">
            <label for="transaction-date">Date</label>
            <input id="transaction-date" type="date" name="date" value="${todayIso()}" required>
          </div>
          <div class="field">
            <label for="transaction-note">Note</label>
            <input id="transaction-note" name="note" value="Given to merchant">
          </div>
        </div>
        <label class="row" style="justify-content:flex-start">
          <input type="checkbox" id="has-interest" name="hasInterest">
          <span>Track interest for this transaction</span>
        </label>
        <div class="form-grid interest-fields" id="interest-fields" hidden>
          <div class="field">
            <label for="interest-mode">Interest type</label>
            <select id="interest-mode" name="interestMode">
              <option value="simple">Simple</option>
              <option value="compound">Compound</option>
            </select>
          </div>
          <div class="field">
            <label for="interest-rate">Rate per period (%)</label>
            <input id="interest-rate" name="interestRate" value="2" inputmode="decimal">
          </div>
          <div class="field">
            <label for="interest-frequency">Frequency</label>
            <select id="interest-frequency" name="interestFrequency">
              <option value="weekly">Weekly</option>
              <option value="monthly" selected>Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div class="field">
            <label for="interest-periods">Periods to show</label>
            <input id="interest-periods" name="interestPeriods" value="6" inputmode="numeric">
          </div>
        </div>
        <div class="row">
          <button type="button" class="secondary-btn" data-action="delete-transaction" hidden>Delete</button>
          <button type="submit" class="primary-btn">Save transaction</button>
        </div>
      </form>
    </div>
  `;
}

function renderCategoryModal() {
  return `
    <div class="modal" id="category-modal" hidden role="dialog" aria-modal="true" aria-labelledby="category-title">
      <form class="modal-card" data-form="category">
        <div class="card-head">
          <div>
            <h2 id="category-title">Add category</h2>
            <p class="small">Used by credit and debit transactions</p>
          </div>
          <button type="button" class="icon-btn" data-action="close-modal" data-modal="category-modal" aria-label="Close">${closeIcon()}</button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="category-name">Category name</label>
            <input id="category-name" name="name" value="Business" required>
          </div>
          <div class="field">
            <label for="category-kind">Default type</label>
            <select id="category-kind" name="kind">
              <option value="debit">Debit</option>
              <option value="credit">Credit</option>
            </select>
          </div>
        </div>
        <div class="row">
          <button type="button" class="secondary-btn" data-action="delete-category" hidden>Delete</button>
          <button type="submit" class="primary-btn">Save category</button>
        </div>
      </form>
    </div>
  `;
}

function renderDetailModal() {
  return `
    <div class="modal" id="detail-modal" hidden role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div class="modal-card wide">
        <div class="card-head">
          <div>
            <h2 id="detail-title">Transaction detail</h2>
            <p class="small" id="detail-subtitle">Interest history</p>
          </div>
          <button type="button" class="icon-btn" data-action="close-modal" data-modal="detail-modal" aria-label="Close">${closeIcon()}</button>
        </div>
        <div class="detail-grid" id="detail-summary"></div>
        <div class="history-wrap">
          <table class="history" aria-label="Interest history">
            <thead>
              <tr>
                <th>Period</th>
                <th>Date</th>
                <th>Opening</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody id="history-body"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function closeIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function openTransactionModal(id) {
  editingTransactionId = id ? Number(id) : null;
  const transaction = state.transactions.find((item) => item.id === editingTransactionId);
  const modal = document.querySelector("#transaction-modal");
  document.querySelector("#transaction-title").textContent = transaction ? "Edit transaction" : "Add transaction";
  document.querySelector('[data-action="delete-transaction"]').hidden = !transaction;
  document.querySelector("#transaction-type").value = transaction?.type || "debit";
  document.querySelector("#transaction-amount").value = transaction?.amount || 1000;
  document.querySelector("#transaction-merchant").value = transaction?.merchant || "Raj Traders";
  document.querySelector("#transaction-category").value = transaction?.categoryId || state.categories[0]?.id || "";
  document.querySelector("#transaction-date").value = transaction?.date || todayIso();
  document.querySelector("#transaction-note").value = transaction?.note || "Given to merchant";
  document.querySelector("#has-interest").checked = Boolean(transaction?.interest);
  document.querySelector("#interest-fields").hidden = !transaction?.interest;
  document.querySelector("#interest-mode").value = transaction?.interest?.mode || "simple";
  document.querySelector("#interest-rate").value = transaction?.interest?.rate || 2;
  document.querySelector("#interest-frequency").value = transaction?.interest?.frequency || "monthly";
  document.querySelector("#interest-periods").value = transaction?.interest?.periods || 6;
  modal.hidden = false;
}

function saveTransaction(form) {
  const data = new FormData(form);
  const hasInterest = data.get("hasInterest") === "on";
  const payload = {
    type: data.get("type"),
    amount: Math.abs(Number(data.get("amount") || 0)),
    merchant: `${data.get("merchant") || "Untitled"}`.trim(),
    categoryId: Number(data.get("categoryId")),
    date: data.get("date") || todayIso(),
    note: `${data.get("note") || ""}`.trim(),
    interest: hasInterest ? {
      mode: data.get("interestMode"),
      rate: Number(data.get("interestRate") || 0),
      frequency: data.get("interestFrequency"),
      periods: Math.max(1, Math.min(120, Number(data.get("interestPeriods") || 1)))
    } : null
  };
  if (editingTransactionId) {
    Object.assign(state.transactions.find((item) => item.id === editingTransactionId), payload);
  } else {
    state.transactions.unshift({ id: state.nextTransactionId++, ...payload });
  }
  saveState();
  closeModal("transaction-modal");
  editingTransactionId = null;
  render();
  showToast("Transaction saved.");
}

function deleteTransaction() {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== editingTransactionId);
  saveState();
  closeModal("transaction-modal");
  editingTransactionId = null;
  render();
  showToast("Transaction deleted.");
}

function openCategoryModal(id) {
  editingCategoryId = id ? Number(id) : null;
  const category = state.categories.find((item) => item.id === editingCategoryId);
  const modal = document.querySelector("#category-modal");
  document.querySelector("#category-title").textContent = category ? "Edit category" : "Add category";
  document.querySelector('[data-action="delete-category"]').hidden = !category;
  document.querySelector("#category-name").value = category?.name || "Business";
  document.querySelector("#category-kind").value = category?.kind || "debit";
  modal.hidden = false;
}

function saveCategory(form) {
  const data = new FormData(form);
  const payload = {
    name: `${data.get("name") || "Untitled"}`.trim(),
    kind: data.get("kind")
  };
  if (editingCategoryId) {
    Object.assign(state.categories.find((item) => item.id === editingCategoryId), payload);
  } else {
    state.categories.push({ id: state.nextCategoryId++, ...payload });
  }
  saveState();
  closeModal("category-modal");
  editingCategoryId = null;
  render();
  showToast("Category saved.");
}

function deleteCategory() {
  if (state.categories.length <= 1) {
    showToast("Keep at least one category.");
    return;
  }
  const fallback = state.categories.find((category) => category.id !== editingCategoryId);
  state.transactions.forEach((transaction) => {
    if (transaction.categoryId === editingCategoryId) transaction.categoryId = fallback.id;
  });
  state.categories = state.categories.filter((category) => category.id !== editingCategoryId);
  saveState();
  closeModal("category-modal");
  editingCategoryId = null;
  render();
  showToast("Category deleted.");
}

function openDetailModal(id) {
  const transaction = state.transactions.find((item) => item.id === Number(id));
  if (!transaction) return;
  const rows = buildInterestHistory(transaction);
  const latest = rows[rows.length - 1];
  document.querySelector("#detail-title").textContent = transaction.merchant;
  document.querySelector("#detail-subtitle").textContent = transaction.interest
    ? `${capitalize(transaction.type)} · ${capitalize(transaction.interest.mode)} interest · ${capitalize(transaction.interest.frequency)}`
    : `${capitalize(transaction.type)} · no interest`;
  document.querySelector("#detail-summary").innerHTML = `
    <div class="detail-cell"><div class="small">Principal</div><div class="stat-small">${money(transaction.amount)}</div></div>
    <div class="detail-cell"><div class="small">Rate</div><div class="stat-small">${transaction.interest?.rate || 0}%</div></div>
    <div class="detail-cell"><div class="small">Frequency</div><div class="stat-small">${transaction.interest ? capitalize(transaction.interest.frequency) : "-"}</div></div>
    <div class="detail-cell"><div class="small">Projected balance</div><div class="stat-small">${money(latest.balance)}</div></div>
  `;
  document.querySelector("#history-body").innerHTML = rows.map((row) => `
    <tr>
      <td>${row.period}</td>
      <td>${row.date}</td>
      <td>${money(row.opening)}</td>
      <td>${money(row.interest)}</td>
      <td>${money(row.balance)}</td>
    </tr>
  `).join("");
  document.querySelector("#detail-modal").hidden = false;
}

function buildInterestHistory(transaction) {
  const terms = transaction.interest || { mode: "simple", rate: 0, frequency: "monthly", periods: 1 };
  const principal = Math.abs(transaction.amount);
  const rate = Number(terms.rate || 0) / 100;
  let balance = principal;
  return Array.from({ length: Math.max(1, Math.min(120, Number(terms.periods || 1))) }, (_, index) => {
    const opening = balance;
    const interest = terms.mode === "simple" ? principal * rate : opening * rate;
    balance = opening + interest;
    return {
      period: index + 1,
      date: addPeriod(transaction.date, terms.frequency, index + 1),
      opening,
      interest,
      balance
    };
  });
}

function addPeriod(date, frequency, index) {
  const next = new Date(`${date}T00:00:00`);
  if (frequency === "weekly") next.setDate(next.getDate() + (7 * index));
  if (frequency === "monthly") next.setMonth(next.getMonth() + index);
  if (frequency === "yearly") next.setFullYear(next.getFullYear() + index);
  return next.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function closeModal(id) {
  const modal = document.querySelector(`#${id}`);
  if (modal) modal.hidden = true;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function saveProfile(form) {
  const data = new FormData(form);
  state.profile.name = `${data.get("name") || "Personal"}`.trim();
  state.profile.currency = data.get("currency");
  saveState();
  render();
  showToast("Profile saved.");
}

function activateLicense() {
  state.license.active = true;
  state.license.purchasedAt = new Date().toISOString();
  saveState();
  render();
  showToast("License activated.");
}

function escapeHtml(value) {
  return `${value ?? ""}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  const view = target.dataset.view;
  if (view) {
    state.view = view;
    saveState();
    render();
    return;
  }
  const filter = target.dataset.filter;
  if (filter) {
    state.filter = filter;
    saveState();
    render();
    return;
  }
  const action = target.dataset.action;
  if (action === "new-transaction") openTransactionModal();
  if (action === "edit-transaction") openTransactionModal(target.dataset.id);
  if (action === "delete-transaction") deleteTransaction();
  if (action === "detail-transaction") openDetailModal(target.dataset.id);
  if (action === "new-category") openCategoryModal();
  if (action === "edit-category") openCategoryModal(target.dataset.id);
  if (action === "delete-category") deleteCategory();
  if (action === "buy-license") activateLicense();
  if (action === "close-modal") closeModal(target.dataset.modal);
});

document.addEventListener("change", (event) => {
  if (event.target.id === "has-interest") {
    document.querySelector("#interest-fields").hidden = !event.target.checked;
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === "transaction") saveTransaction(form);
  if (form.dataset.form === "category") saveCategory(form);
  if (form.dataset.form === "profile") saveProfile(form);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
