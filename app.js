const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const defaultState = {
  tab: "wallet",
  view: "home",
  wallet: 0,
  savings: 164.58,
  hidden: false,
  timeDeposit: 12500,
  goal: {
    name: "japan",
    emoji: "👠",
    balance: 0,
    target: 25000,
    daysLeft: 180,
    rate: 8,
    account: "8189 3753 6162",
  },
  transactions: [
    { title: "Created account", detail: "japan", age: "10 minutes ago", amount: "" },
    { title: "Transferred to", detail: "Maya Black E... (9278)", age: "22 hours ago", amount: "- ₱12,500.00" },
  ],
};

let state = loadState();
const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modalRoot");

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem("fakeMayaState")) };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem("fakeMayaState", JSON.stringify(state));
}

function money(value) {
  return state.hidden ? "••••••" : peso.format(value);
}

function setState(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
}

function go(tab) {
  setState({ tab, view: "home" });
}

function openView(view) {
  setState({ view });
}

function addTransaction(title, detail, amount = "") {
  state.transactions.unshift({ title, detail, amount, age: "Just now" });
  state.transactions = state.transactions.slice(0, 5);
}

function icon(name) {
  const icons = {
    user: "♙",
    bell: "♧",
    eye: "◉",
    in: "↙",
    out: "↗",
    bank: "▥",
    ticket: "◉",
    crypto: "◈",
    hand: "♬",
    phone: "▯",
    bills: "▣",
    shop: "▰",
    more: "•••",
    home: "m",
    scan: "⌗",
    grid: "▦",
    help: "?",
    chevron: "›",
    account: "♙",
    heart: "♡",
    copy: "▢",
  };
  return icons[name] || "";
}

function shell(content) {
  return `
    <div class="statusbar">
      <span>9:43</span>
      <span class="signal"><span>▮▮▮</span><span>⌁</span><span class="battery">36</span></span>
    </div>
    ${content}
    <nav class="bottom-nav" aria-label="Primary app actions">
      <button class="bottom-btn active" aria-label="Home">${icon("home")}</button>
      <button class="bottom-btn" aria-label="Scan">${icon("scan")}</button>
      <button class="bottom-btn" aria-label="Services">${icon("grid")}</button>
      <button class="bottom-btn" aria-label="Help">${icon("help")}</button>
    </nav>
  `;
}

function topChrome() {
  return `
    <header class="topbar">
      <button class="avatar" aria-label="Profile">${icon("user")}</button>
      <div class="top-actions">
        <button class="bell" aria-label="Notifications">♧</button>
        <span class="xp">183 XP</span>
      </div>
    </header>
    <nav class="tabs" aria-label="Account sections">
      ${["wallet", "savings", "credit", "loans", "cards"].map((tab) => `
        <button class="tab ${state.tab === tab ? "active" : ""}" onclick="go('${tab}')">
          ${tab[0].toUpperCase() + tab.slice(1)}
        </button>
      `).join("")}
    </nav>
  `;
}

function balanceCard({ amount, label, actions, extra = "" }) {
  return `
    <section class="hero-card">
      <div class="balance-line">
        <div>
          <div class="balance">${money(amount)}</div>
          <div class="subline">${label} ${extra}</div>
        </div>
        <button class="eye" onclick="setState({ hidden: !state.hidden })" aria-label="Hide balance">${icon("eye")}</button>
      </div>
      <div class="actions">
        ${actions}
      </div>
    </section>
  `;
}

function renderWallet() {
  const services = [
    ["bank", "Bank<br>transfer", ""],
    ["ticket", "Raffle<br>Promo", ""],
    ["crypto", "Crypto", ""],
    ["hand", "Refer<br>& Earn", "Win ₱1K"],
    ["phone", "Load", ""],
    ["bills", "Bills", ""],
    ["shop", "Shop", ""],
    ["more", "More", ""],
  ];

  return `
    ${topChrome()}
    ${balanceCard({
      amount: state.wallet,
      label: "Wallet balance",
      extra: '<span class="green-link">Auto cash in</span>',
      actions: `
        <button class="pill-btn" onclick="openMoneySheet('cashin')"><span>${icon("in")}</span> Cash in</button>
        <button class="pill-btn" onclick="openMoneySheet('send')"><span>${icon("out")}</span> Send</button>
      `,
    })}
    <section class="credit-strip">
      <div><h3>Easy Credit</h3><div class="muted">Borrow up to ₱50K</div></div>
      <button class="mini-btn" onclick="go('credit')">Get it now</button>
    </section>
    <section class="quick-grid">
      ${services.map(([key, label, badge]) => `
        <button class="service" onclick="toast('${label.replace("<br>", " ")} opened')">
          <span class="service-icon">${badge ? `<span class="badge-red">${badge}</span>` : ""}${icon(key)}</span>
          <span>${label}</span>
        </button>
      `).join("")}
    </section>
    <section class="promo">
      <div><b>EXTRA BILLS NA<br>EXTRA BUDGET SA</b><br><strong>maya</strong></div>
      <span>Up to ₱250,000 in seconds ›</span>
    </section>
    ${transactionsPanel()}
  `;
}

function renderSavings() {
  return `
    ${topChrome()}
    ${balanceCard({
      amount: state.savings + state.timeDeposit + state.goal.balance,
      label: "Total savings",
      actions: `
        <button class="pill-btn" onclick="openMoneySheet('deposit')"><span>${icon("in")}</span> Deposit</button>
        <button class="pill-btn" onclick="openMoneySheet('transfer')"><span>${icon("out")}</span> Transfer</button>
      `,
    })}
    <button class="save-card" onclick="openView('mySavings')">
      <div>🐷 <span class="rate-badge">4.0% p.a. 🔥</span></div>
      <h2>My Savings ›</h2>
      <div>${money(state.savings)}</div>
      <div class="save-foot"><span>364 days left at 4% p.a.</span><span>Boost more ›</span></div>
    </button>
    <button class="black-card" onclick="toast('Time Deposit account flow opened')">
      <small>More ways to save</small>
      <h2>Time Deposit <span class="green-link">plus</span></h2>
      <div class="muted">Save for longer and earn up to 6% p.a.</div>
      <div class="black-foot"><span>Open an account now</span><span class="green-link">›</span></div>
    </button>
    <h2 class="section-title">Personal Goals</h2>
    <section class="split-grid">
      <button class="goal-card pink" onclick="openView('goal')">
        <div>${state.goal.emoji} <span class="rate-badge" style="background:#fff;color:#111">${state.goal.balance ? state.goal.rate : 0}.0% p.a.</span></div>
        <h2>${state.goal.name}</h2>
        <div class="balance" style="font-size:28px">${money(state.goal.balance)}</div>
      </button>
      <button class="goal-card create" onclick="openGoalSheet()">
        <div><span class="plus">+</span><h3>Create a new<br>Personal Goal</h3><div class="muted">🚀 Earn up to 8% p.a.</div></div>
      </button>
    </section>
    <section class="express">
      <h2 class="section-title">Express Deposit</h2>
      <div class="list-card">
        <button class="list-row" onclick="openMoneySheet('timeDeposit')">
          <span class="left-stack"><span class="card-thumb">▤</span><span><b>Maya Black</b><br><span class="muted">${money(state.timeDeposit)}</span></span></span>
          <span class="muted">›</span>
        </button>
        <span class="rate-chip">3.5% p.a.</span>
      </div>
    </section>
    ${footerCopy()}
  `;
}

function renderCredit() {
  return `
    ${topChrome()}
    <section class="credit-card">
      <span class="label-pill">MAYA EASY CREDIT</span>
      <h1>Extra budget?</h1>
      <p class="muted">Get up to ₱50,000 in seconds with Maya Easy Credit</p>
      <button class="apply-btn" onclick="toast('Credit application started')">Apply now</button>
      <div class="center-copy">Credit approval is based on your eligibility</div>
    </section>
    <section class="panel help-card">🤔 <b>Need help?</b><br><span class="muted">Visit our <span class="green-link">Help Center</span> to learn more</span></section>
    ${footerCopy("Maya Easy Credit is powered by")}
  `;
}

function renderLoans() {
  return `
    ${topChrome()}
    <section class="loan-card">
      <h1>Borrow up to<br>₱250,000 instantly</h1>
      <p class="muted">Fund your next big life move and pay in monthly installments with <b>Maya Personal Loan</b></p>
      <button class="apply-btn" onclick="toast('Loan application started')">Apply now</button>
      <div class="center-copy">Loan approval is based on your eligibility</div>
    </section>
    <div class="placeholder-banner"></div>
    <h2 class="section-title">More actions</h2>
    <section class="list-card">
      ${["Account summary", "View closed loans", "Learn more about loans"].map((item) => `
        <button class="list-row" onclick="toast('${item}')"><span class="left-stack"><span>${icon("account")}</span><b>${item}</b></span><span class="muted">›</span></button>
      `).join("")}
    </section>
    ${footerCopy("Maya Loan is operated by")}
  `;
}

function renderCards() {
  return `
    ${topChrome()}
    <section class="panel">
      <h2>Maya Cards</h2>
      <p class="muted">A card management area styled after the app tabs. Link physical and virtual cards, set limits, and review activity.</p>
      <button class="apply-btn" onclick="toast('Card request started')">Request a card</button>
    </section>
  `;
}

function renderSavingsDetail() {
  return `
    <section class="detail savings">
      <div class="statusbar"><span>9:44</span><span class="signal"><span>▮▮▮</span><span>⌁</span><span class="battery">36</span></span></div>
      <div class="detail-head">
        <button class="back" onclick="openView('home')" aria-label="Back">‹</button>
        <span></span>
        <span class="pig-box">🐷</span>
      </div>
      <div class="detail-title">
        <h2>My Savings</h2>
        <div class="account-num">8027 5119 2872 <button onclick="toast('Account number copied')" class="back" style="font-size:18px">${icon("copy")}</button></div>
        <h1>${money(state.savings)} <button class="eye" onclick="setState({ hidden: !state.hidden })">${icon("eye")}</button></h1>
      </div>
      <div class="detail-actions">
        <button class="pill-btn solid" onclick="openMoneySheet('deposit')">${icon("in")} Deposit</button>
        <button class="pill-btn solid" onclick="openMoneySheet('transfer')">${icon("out")} Transfer</button>
      </div>
      <div class="drag-handle"></div>
      <section class="panel">
        <div class="transactions-head"><h2>Your interest</h2><span class="muted">›</span></div>
        <div class="interest-grid">
          <div><span class="muted">Current rate</span><br><b>4.0% p.a.</b></div>
          <div><span class="muted">Interest earned this month</span><br><b>₱0.15</b></div>
        </div>
        <div class="boost"><span>🤑 Pay with Maya to boost your interest</span><span class="rate-mini">UP TO 17% ›</span></div>
      </section>
      <section class="settings-card">
        <button class="list-row" onclick="toast('Account details opened')"><span class="left-stack"><span>${icon("account")}</span><b>View account details</b></span><span class="muted">›</span></button>
        <button class="list-row" onclick="toast('Favorites opened')"><span class="left-stack"><span>${icon("heart")}</span><b>View favorites</b></span><span class="muted">›</span></button>
      </section>
      ${transactionsPanel()}
    </section>
  `;
}

function renderGoalDetail() {
  const pct = Math.min(100, Math.round((state.goal.balance / state.goal.target) * 100));
  return `
    <section class="detail goal">
      <div class="statusbar"><span>9:43</span><span class="signal"><span>▮▮▮</span><span>⌁</span><span class="battery">36</span></span></div>
      <div class="detail-head">
        <button class="back" onclick="openView('home')" aria-label="Back">‹</button>
        <h3 style="text-align:center">Goal account</h3>
        <span></span>
      </div>
      <div class="detail-title">
        <div style="font-size:34px">${state.goal.emoji}</div>
        <h1>${state.goal.name}</h1>
        <div class="account-num">${state.goal.account} <button onclick="toast('Goal account copied')" class="back" style="font-size:18px">${icon("copy")}</button></div>
      </div>
      <section class="account-summary">
        <div class="progress-row"><b class="muted">${state.goal.daysLeft} DAYS LEFT</b><span class="eye">${icon("eye")}</span></div>
        <div class="progress-row"><div><div class="balance" style="font-size:42px">${money(state.goal.balance)}</div><h2 class="muted">out of ${peso.format(state.goal.target)}</h2></div><div style="font-size:34px">${pct}%</div></div>
        <div class="progress" style="--p:${pct}%"><span></span></div>
        <b>Up to ${state.goal.rate}% p.a. for goals up to ₱100,000 ⓘ</b>
      </section>
      <button class="wide-deposit" onclick="openMoneySheet('goalDeposit')">${icon("in")} Deposit</button>
      <section class="goal-boost"><b>🐷 Give your goal a boost!</b><span class="white-pill">up to 8% p.a. ›</span></section>
      <h3 class="muted" style="letter-spacing:3px">GOAL SETTINGS</h3>
      <section class="settings-card">
        <button class="list-row" onclick="toast('Goal account details opened')"><span class="left-stack"><span>${icon("account")}</span><b>View account details</b></span><span class="muted">›</span></button>
      </section>
      ${transactionsPanel()}
    </section>
  `;
}

function transactionsPanel() {
  return `
    <section class="panel transactions">
      <div class="transactions-head"><h2>Transactions</h2><button class="green-link" onclick="toast('All transactions opened')">See all</button></div>
      ${state.transactions.slice(0, 2).map((tx) => `
        <div class="transaction-line">
          <span>${tx.title}<strong>${tx.detail}</strong></span>
          <span style="text-align:right">${tx.age}<strong>${tx.amount}</strong></span>
        </div>
      `).join("")}
    </section>
  `;
}

function footerCopy(prefix = "Maya Savings is powered by Maya Bank, Inc.") {
  return `
    <footer class="footer-copy">
      <p>${prefix}</p>
      <div class="maya-bank">maya <span class="bank-pill">BANK</span></div>
      <p>Deposits are insured by PDIC up to ₱1 Million per depositor. Maya Bank, Inc. is regulated by the Bangko Sentral ng Pilipinas.</p>
    </footer>
  `;
}

function openMoneySheet(kind) {
  const labels = {
    cashin: ["Cash in", "Add money to your wallet"],
    send: ["Send", "Send from your wallet"],
    deposit: ["Deposit", "Move wallet money to My Savings"],
    transfer: ["Transfer", "Move savings money to your wallet"],
    timeDeposit: ["Express Deposit", "Add to Maya Black time deposit"],
    goalDeposit: ["Goal Deposit", `Deposit to ${state.goal.name}`],
  };
  const [title, desc] = labels[kind];
  modalRoot.className = "modal-root active";
  modalRoot.setAttribute("aria-hidden", "false");
  modalRoot.innerHTML = `
    <div class="scrim" onclick="closeModal()"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
      <h2 id="sheetTitle">${title}</h2>
      <p class="muted">${desc}</p>
      <label class="field">Amount
        <input id="amountInput" inputmode="decimal" type="number" min="1" step="0.01" placeholder="₱0.00" autofocus />
      </label>
      <div class="sheet-actions">
        <button class="pill-btn ghost" onclick="closeModal()">Cancel</button>
        <button class="pill-btn solid" onclick="submitMoney('${kind}')">Continue</button>
      </div>
    </section>
  `;
  document.querySelector("#amountInput")?.focus();
}

function submitMoney(kind) {
  const amount = Number(document.querySelector("#amountInput")?.value || 0);
  if (!amount || amount < 0) {
    toast("Enter a valid amount");
    return;
  }

  if (kind === "cashin") {
    state.wallet += amount;
    addTransaction("Cash in", "Wallet", `+ ${peso.format(amount)}`);
  }
  if (kind === "send") {
    if (amount > state.wallet) return toast("Insufficient wallet balance");
    state.wallet -= amount;
    addTransaction("Sent money", "Maya contact", `- ${peso.format(amount)}`);
  }
  if (kind === "deposit") {
    if (amount > state.wallet) return toast("Cash in first to deposit");
    state.wallet -= amount;
    state.savings += amount;
    addTransaction("Deposited to", "My Savings", `+ ${peso.format(amount)}`);
  }
  if (kind === "transfer") {
    if (amount > state.savings) return toast("Insufficient savings balance");
    state.savings -= amount;
    state.wallet += amount;
    addTransaction("Transferred from", "My Savings", `- ${peso.format(amount)}`);
  }
  if (kind === "timeDeposit") {
    if (amount > state.wallet) return toast("Cash in first for express deposit");
    state.wallet -= amount;
    state.timeDeposit += amount;
    addTransaction("Express deposit", "Maya Black", `+ ${peso.format(amount)}`);
  }
  if (kind === "goalDeposit") {
    if (amount > state.wallet) return toast("Cash in first to fund your goal");
    state.wallet -= amount;
    state.goal.balance += amount;
    addTransaction("Deposited to goal", state.goal.name, `+ ${peso.format(amount)}`);
  }
  saveState();
  closeModal();
  render();
  toast(`${peso.format(amount)} processed`);
}

function openGoalSheet() {
  modalRoot.className = "modal-root active";
  modalRoot.setAttribute("aria-hidden", "false");
  modalRoot.innerHTML = `
    <div class="scrim" onclick="closeModal()"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="goalTitle">
      <h2 id="goalTitle">Create a Personal Goal</h2>
      <label class="field">Goal name <input id="goalName" value="tokyo trip" /></label>
      <label class="field">Target amount <input id="goalTarget" type="number" value="50000" /></label>
      <div class="sheet-actions">
        <button class="pill-btn ghost" onclick="closeModal()">Cancel</button>
        <button class="pill-btn solid" onclick="submitGoal()">Create</button>
      </div>
    </section>
  `;
}

function submitGoal() {
  const name = document.querySelector("#goalName").value.trim() || "new goal";
  const target = Number(document.querySelector("#goalTarget").value || 25000);
  state.goal = { ...state.goal, name, target, balance: 0, daysLeft: 180, rate: 8 };
  addTransaction("Created account", name);
  saveState();
  closeModal();
  openView("goal");
}

function closeModal() {
  modalRoot.className = "modal-root";
  modalRoot.setAttribute("aria-hidden", "true");
  modalRoot.innerHTML = "";
}

function toast(message) {
  const old = document.querySelector(".toast");
  old?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

function render() {
  let content = "";
  if (state.view === "mySavings") {
    app.innerHTML = renderSavingsDetail();
    return;
  }
  if (state.view === "goal") {
    app.innerHTML = renderGoalDetail();
    return;
  }
  if (state.tab === "wallet") content = renderWallet();
  else if (state.tab === "savings") content = renderSavings();
  else if (state.tab === "credit") content = renderCredit();
  else if (state.tab === "loans") content = renderLoans();
  else content = renderCards();
  app.innerHTML = shell(content);
}

render();
