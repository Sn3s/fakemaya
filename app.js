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
  depositFlow: null,
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

function startDepositFlow() {
  state.depositFlow = {
    step: 1,
    source: null,
    destination: null,
    amount: 0,
  };
  setState({ view: "depositFlow" });
}

function updateDepositFlow(patch) {
  state.depositFlow = { ...state.depositFlow, ...patch };
  saveState();
  render();
}

function resetDepositFlow() {
  state.depositFlow = null;
  setState({ view: "home" });
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
        <button class="pill-btn" onclick="startDepositFlow()"><span>${icon("in")}</span> Deposit</button>
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
        <button class="pill-btn solid" onclick="startDepositFlow()">${icon("in")} Deposit</button>
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

function renderDepositFlow() {
  const flow = state.depositFlow || { step: 1 };
  const titles = {
    1: "Select a fund source",
    2: "Select a destination",
    3: `Deposit to ${flow.destination === "goal" ? state.goal.name : "my account"}`,
    4: "Review deposit",
  };
  return `
    <section class="deposit-flow">
      <div class="statusbar"><span>10:15</span><span class="signal"><span>▮▮▮</span><span>⌁</span><span class="battery">33</span></span></div>
      <div class="flow-head">
        <button class="back" onclick="depositBack()" aria-label="Back">‹</button>
        <div class="flow-progress" style="--step:${flow.step}"><span></span></div>
        <b>${flow.step}/4</b>
      </div>
      <h1 class="flow-title">${titles[flow.step]}</h1>
      ${flow.step === 1 ? depositSourceStep() : ""}
      ${flow.step === 2 ? depositDestinationStep() : ""}
      ${flow.step === 3 ? depositAmountStep() : ""}
      ${flow.step === 4 ? depositReviewStep() : ""}
    </section>
  `;
}

function depositSourceStep() {
  return `
    <h3 class="flow-kicker">MY ACCOUNTS</h3>
    <button class="account-option dark" onclick="chooseDepositSource('wallet')">
      <span class="account-left"><span>⚡</span><span><b>My Wallet</b><small>+639173728852</small></span></span>
      <strong>${money(state.wallet)}</strong>
    </button>
    <button class="account-option mint" onclick="chooseDepositSource('savings')">
      <span class="account-left"><span>🐷</span><span><b>My Savings</b><small>•••• •••• 2872</small></span></span>
      <strong>${money(state.savings)}</strong>
    </button>
    <h3 class="flow-kicker">OTHER SOURCES</h3>
    <button class="account-option light" onclick="chooseDepositSource('bank')">
      <span class="account-left"><span>${icon("bank")}</span><b>Other banks</b></span>
      <span class="muted">›</span>
    </button>
  `;
}

function depositDestinationStep() {
  return `
    <button class="account-option mint" onclick="chooseDepositDestination('savings')">
      <span class="account-left"><span>🐷</span><span><b>My Savings</b><small>•••• •••• 2872</small></span></span>
      <strong>${money(state.savings)}</strong>
    </button>
    <button class="account-option pink" onclick="chooseDepositDestination('goal')">
      <span class="account-left"><span>${state.goal.emoji}</span><span><b>${state.goal.name}</b><small>•••• •••• 6162</small></span></span>
      <strong>${money(state.goal.balance)}</strong>
    </button>
  `;
}

function depositAmountStep() {
  const balance = depositSourceBalance();
  const disabled = !state.depositFlow.amount || state.depositFlow.amount <= 0;
  const helper = state.depositFlow.source === "bank"
    ? "Enter the amount you want to deposit from another bank"
    : `You have ${money(balance)} in your ${depositSourceLabel().toLowerCase()}`;
  return `
    <label class="amount-field">
      <span>Deposit amount</span>
      <input id="depositAmount" inputmode="decimal" type="number" min="1" step="0.01" placeholder="Enter deposit amount" value="${state.depositFlow.amount || ""}" oninput="setDepositAmount(this.value)" autofocus />
    </label>
    <p class="amount-help">${helper}</p>
    <button class="flow-continue ${disabled ? "disabled" : ""}" onclick="continueDepositAmount()" ${disabled ? "disabled" : ""}>Continue</button>
  `;
}

function depositReviewStep() {
  const source = depositSourceLabel();
  const destination = depositDestinationLabel();
  const amount = Number(state.depositFlow.amount || 0);
  return `
    <section class="review-card">
      <div class="review-amount">${peso.format(amount)}</div>
      <div class="review-row"><span>From</span><b>${source}</b></div>
      <div class="review-row"><span>To</span><b>${destination}</b></div>
      <div class="review-row"><span>Fee</span><b>Free</b></div>
    </section>
    <button class="flow-continue" onclick="finishDepositFlow()">Deposit</button>
  `;
}

function chooseDepositSource(source) {
  updateDepositFlow({ source, step: 2 });
}

function chooseDepositDestination(destination) {
  if (state.depositFlow.source === destination) {
    toast("Choose a different destination");
    return;
  }
  updateDepositFlow({ destination, step: 3 });
  setTimeout(() => document.querySelector("#depositAmount")?.focus(), 0);
}

function setDepositAmount(value) {
  state.depositFlow.amount = Number(value || 0);
  saveState();
  const button = document.querySelector(".flow-continue");
  if (button) {
    const disabled = !state.depositFlow.amount || state.depositFlow.amount <= 0;
    button.disabled = disabled;
    button.classList.toggle("disabled", disabled);
  }
}

function continueDepositAmount() {
  const amount = Number(state.depositFlow.amount || 0);
  const balance = depositSourceBalance();
  if (!amount || amount <= 0) return toast("Enter a valid amount");
  if (state.depositFlow.source !== "bank" && amount > balance) return toast(`Insufficient ${depositSourceLabel().toLowerCase()} balance`);
  updateDepositFlow({ step: 4 });
}

function finishDepositFlow() {
  const amount = Number(state.depositFlow.amount || 0);
  const { source, destination } = state.depositFlow;
  if (source !== "bank") {
    if (amount > depositSourceBalance()) return toast(`Insufficient ${depositSourceLabel().toLowerCase()} balance`);
    if (source === "wallet") state.wallet -= amount;
    if (source === "savings") state.savings -= amount;
  }
  if (destination === "savings") state.savings += amount;
  if (destination === "goal") state.goal.balance += amount;
  addTransaction("Deposited to", depositDestinationLabel(), `+ ${peso.format(amount)}`);
  state.depositFlow = null;
  state.view = destination === "goal" ? "goal" : "mySavings";
  saveState();
  render();
  toast(`${peso.format(amount)} deposited`);
}

function depositBack() {
  if (!state.depositFlow || state.depositFlow.step === 1) {
    resetDepositFlow();
    return;
  }
  updateDepositFlow({ step: state.depositFlow.step - 1 });
}

function depositSourceBalance() {
  if (!state.depositFlow) return 0;
  if (state.depositFlow.source === "wallet") return state.wallet;
  if (state.depositFlow.source === "savings") return state.savings;
  return 0;
}

function depositSourceLabel() {
  const source = state.depositFlow?.source;
  if (source === "wallet") return "My Wallet";
  if (source === "savings") return "My Savings";
  return "Other banks";
}

function depositDestinationLabel() {
  return state.depositFlow?.destination === "goal" ? state.goal.name : "My Savings";
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
  if (state.view === "depositFlow") {
    app.innerHTML = renderDepositFlow();
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
