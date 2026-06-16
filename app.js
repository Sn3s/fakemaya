const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const defaultState = {
  tab: "wallet",
  view: "home",
  wallet: 1500.00, // starting wallet balance
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
  
  // Credit Journey State Properties
  creditView: "home", // home, promo, privacy, form, approved
  creditLimit: 15000.00,
  creditUsed: 0.00,
  creditForm: {
    billingDay: null,
    gender: "",
    maritalStatus: "",
    altMobile: "",
    motherFirst: "",
    motherMiddle: "",
    motherLast: "",
    noMiddleName: false
  }
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
    user: "♙", bell: "♧", eye: "◉", in: "↙", out: "↗", bank: "▥", ticket: "◉",
    crypto: "◈", hand: "♬", phone: "▯", bills: "▣", shop: "▰", more: "•••",
    home: "m", scan: "⌗", grid: "▦", help: "?", chevron: "›", account: "♙",
    heart: "♡", copy: "▢"
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
  `;
}

function topChrome() {
  return `
    <header class="topbar">
      <button class="avatar" aria-label="Profile" onclick="openView('profile')">${icon("user")}</button>
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
    ${state.creditView === "approved" ? `
      <section class="credit-summary-widget" onclick="go('credit')">
        <div class="widget-row">
          <span>💳 Maya Easy Credit Line Available</span>
          <strong class="green-link">${money(state.creditLimit - state.creditUsed)}</strong>
        </div>
      </section>
    ` : ""}
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
    ${footerCopy()}
  `;
}

/* ==========================================================================
   UPDATED CREDIT VIEWS ENGINE (Bugs fixed + Real App Journey Extensions)
   ========================================================================== */
function renderCredit() {
  if (!state.creditView) state.creditView = "home";
  
  if (state.creditView === "home") {
    return `
      ${topChrome()}
      <section class="credit-card">
        <span class="label-pill">MAYA EASY CREDIT</span>
        <h1>Extra budget?</h1>
        <p class="muted">Get up to ₱50,000 in seconds with Maya Easy Credit</p>
        <button class="apply-btn" onclick="setCreditView('promo')">Apply now</button>
        <div class="center-copy">Credit approval is based on your eligibility</div>
      </section>
      <section class="panel help-card">🤔 <b>Need help?</b><br><span class="muted">Visit our <span class="green-link">Help Center</span> to learn more</span></section>
      ${footerCopy("Maya Easy Credit is powered by")}
    `;
  }
  
  if (state.creditView === "promo") return renderCreditPromo();
  if (state.creditView === "privacy") return renderCreditPrivacy();
  if (state.creditView === "form") return renderCreditForm();
  if (state.creditView === "approved") return renderCreditApprovedDashboard();
}

function setCreditView(view) {
  state.creditView = view;
  if (view === 'form' && !state.creditForm) {
    state.creditForm = {
      billingDay: null, gender: "", maritalStatus: "", altMobile: "",
      motherFirst: "", motherMiddle: "", motherLast: "", noMiddleName: false
    };
  }
  saveState();
  render();
}

function renderCreditPromo() {
  return `
    <section class="credit-flow-page black-theme">
      <div class="flow-header-nav">
        <button class="back-btn-light" onclick="setCreditView('home')">‹</button>
      </div>
      <div class="scrollable-flow-body">
        <div class="promo-header-group">
          <h1 class="promo-main-title">Get the funds you need with Maya Easy Credit!</h1>
          <p class="promo-subtitle">Up to ₱50,000 in seconds</p>
        </div>
        <div class="puzzle-grid">
          <div class="puzzle-box box-1">
            <h3>Pay with credit, in-store and online</h3>
            <p>Shop your favorite brands via QR Ph</p>
          </div>
          <div class="puzzle-box box-2">
            <span class="purple-tag">COMING SOON</span>
            <h3>Pay your bills on time</h3>
          </div>
          <div class="puzzle-box box-3">
            <h3>Transfer to your Wallet</h3>
          </div>
          <div class="puzzle-box box-4">
            <h3>Get load, gaming, pins, and more</h3>
            <p>Easily buy anything in our Shop.</p>
          </div>
        </div>
        <div class="promo-footer-notice">
          For a secure and hassle-free application, your information will be shared with Maya Bank, Inc.
        </div>
      </div>
      <div class="fixed-bottom-action-container">
        <button class="apply-btn solid-white" onclick="setCreditView('privacy')">Apply Now</button>
      </div>
    </section>
  `;
}

function renderCreditPrivacy() {
  return `
    <section class="credit-flow-page white-theme">
      <div class="flow-header-nav">
        <button class="back-btn-dark" onclick="setCreditView('promo')">‹</button>
        <span class="nav-page-title">Privacy Notice</span>
      </div>
      <div class="scrollable-flow-body text-body-padding">
        <h3>Maya Bank, Inc. Privacy Policy</h3>
        <p>This Privacy Notice explains how Maya Bank, Inc. collects, protects, uses, and shares your personal information when you apply for and use Maya Easy Credit lines.</p>
        <p>To provide credit evaluation, credit limit assessments, financial underwriting, fraud protection, and automated account management, we require sharing permissions with Maya Bank systems.</p>
        <p>By clicking continue, you grant explicit consent to assess transactional histories inside the digital application ecosystem to calibrate active micro-lending risk assessments under BSP guidelines.</p>
      </div>
      <div class="fixed-bottom-action-container">
        <button class="continue-blue-btn" onclick="setCreditView('form')">Continue</button>
      </div>
    </section>
  `;
}

function renderCreditForm() {
  const form = state.creditForm || {};
  
  const isBillingSet = form.billingDay !== null && form.billingDay !== undefined;
  const isPersonalValid = form.gender && form.maritalStatus && String(form.altMobile).trim().length > 0;
  const isMotherValid = String(form.motherFirst).trim().length > 0 && 
                        (form.noMiddleName || String(form.motherMiddle).trim().length > 0) && 
                        String(form.motherLast).trim().length > 0;
                        
  const isFormComplete = isBillingSet && isPersonalValid && isMotherValid;

  return `
    <section class="credit-flow-page white-theme">
      <div class="form-top-bar">
        <button class="back-btn-dark" onclick="setCreditView('privacy')">‹</button>
        <div class="form-progress-bar-wrapper">
          <div class="form-progress-bar-fill" style="width: 50%;"></div>
        </div>
        <span class="form-step-indicator">1/2</span>
      </div>

      <div class="scrollable-flow-body input-form-layout" id="creditFormScrollBody">
        <div class="form-intro-block">
          <h1>Set Up your credit</h1>
          <p class="muted">To enjoy Maya Easy Credit, please provide the following information:</p>
        </div>

        <div class="credit-input-form">
          <div class="form-section-title">BILLING DETAILS</div>
          
          <div class="form-group select-trigger" onclick="openBillingWheelSelector()">
            <label>Billing end date</label>
            <div class="custom-select-display ${isBillingSet ? 'has-val' : ''}">
              ${isBillingSet ? `Every ${form.billingDay}${getOrdinalSuffix(form.billingDay)} of the month` : 'Select a billing end date'}
            </div>
          </div>

          <div class="form-group static-field">
            <label>Verified email address</label>
            <input type="text" value="juan.delacruz@gmail.com" disabled class="disabled-email-input" />
          </div>

          <div class="form-section-title">PERSONAL DETAILS</div>
          
          <div class="form-group">
            <label>Gender</label>
            <select onchange="handleFormSelect('gender', this.value)">
              <option value="" ${!form.gender ? 'selected' : ''} disabled>Select Gender</option>
              <option value="Male" ${form.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${form.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${form.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>Marital status</label>
            <select onchange="handleFormSelect('maritalStatus', this.value)">
              <option value="" ${!form.maritalStatus ? 'selected' : ''} disabled>Select Marital Status</option>
              <option value="Single" ${form.maritalStatus === 'Single' ? 'selected' : ''}>Single</option>
              <option value="Married" ${form.maritalStatus === 'Married' ? 'selected' : ''}>Married</option>
              <option value="Divorced" ${form.maritalStatus === 'Divorced' ? 'selected' : ''}>Divorced</option>
              <option value="Widowed" ${form.maritalStatus === 'Widowed' ? 'selected' : ''}>Widowed</option>
            </select>
          </div>

          <div class="form-group">
            <label>Alternative mobile number</label>
            <input type="tel" data-field="altMobile" placeholder="e.g. 09123456789" value="${form.altMobile || ''}" oninput="handleFormInput(event)" />
          </div>

          <div class="form-section-title">MOTHERS MAIDEN NAME</div>
          
          <div class="form-group">
            <label>Mothers maiden first name</label>
            <input type="text" data-field="motherFirst" placeholder="Enter first name" value="${form.motherFirst || ''}" oninput="handleFormInput(event)" />
          </div>

          <div class="form-group">
            <label>Mothers maiden middle name</label>
            <input type="text" id="motherMiddleInput" data-field="motherMiddle" placeholder="Enter middle name" ${form.noMiddleName ? 'disabled' : ''} value="${form.motherMiddle || ''}" oninput="handleFormInput(event)" />
            <div class="checkbox-container">
              <input type="checkbox" id="noMiddleNameCheck" ${form.noMiddleName ? 'checked' : ''} onchange="handleFormCheckbox(this.checked)" />
              <label for="noMiddleNameCheck">No legal middle name</label>
            </div>
          </div>

          <div class="form-group">
            <label>Mothers maiden last name</label>
            <input type="text" data-field="motherLast" placeholder="Enter last name" value="${form.motherLast || ''}" oninput="handleFormInput(event)" />
          </div>
        </div>
      </div>

      <div class="fixed-bottom-action-container">
        <button id="creditSubmitBtn" class="submit-credit-form-btn ${isFormComplete ? 'complete-green' : ''}" ${!isFormComplete ? 'disabled' : ''} onclick="submitCreditApplication()">
          Continue
        </button>
      </div>
    </section>
  `;
}

/* Event handling functions to fix input focus loss bugs */
function handleFormInput(e) {
  const field = e.target.getAttribute('data-field');
  state.creditForm[field] = e.target.value;
  saveState();
  
  // Recalculate and update the button styling without rerendering the DOM
  const form = state.creditForm;
  const isBillingSet = form.billingDay !== null && form.billingDay !== undefined;
  const isPersonalValid = form.gender && form.maritalStatus && String(form.altMobile).trim().length > 0;
  const isMotherValid = String(form.motherFirst).trim().length > 0 && 
                        (form.noMiddleName || String(form.motherMiddle).trim().length > 0) && 
                        String(form.motherLast).trim().length > 0;
  const isFormComplete = isBillingSet && isPersonalValid && isMotherValid;
  
  const submitBtn = document.querySelector("#creditSubmitBtn");
  if (submitBtn) {
    if (isFormComplete) {
      submitBtn.classList.add("complete-green");
      submitBtn.removeAttribute("disabled");
    } else {
      submitBtn.classList.remove("complete-green");
      submitBtn.setAttribute("disabled", "true");
    }
  }
}

function handleFormSelect(field, val) {
  state.creditForm[field] = val;
  saveState();
  render();
}

function handleFormCheckbox(checked) {
  state.creditForm.noMiddleName = checked;
  if(checked) state.creditForm.motherMiddle = "";
  saveState();
  render();
}

function getOrdinalSuffix(i) {
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) return "st";
  if (j == 2 && k != 12) return "nd";
  if (j == 3 && k != 13) return "rd";
  return "th";
}

function openBillingWheelSelector() {
  modalRoot.className = "modal-root active";
  modalRoot.setAttribute("aria-hidden", "false");
  
  let optionsHtml = '';
  for(let d = 1; d <= 27; d++) {
    optionsHtml += `<option value="${d}">Day ${d}</option>`;
  }

  modalRoot.innerHTML = `
    <div class="scrim" onclick="closeModal()"></div>
    <div class="sheet billing-wheel-sheet" role="dialog" aria-modal="true">
      <h2>Select a billing end date</h2>
      <div class="wheel-picker-wrapper">
        <select id="wheelScrollSelector" size="5">
          ${optionsHtml}
        </select>
      </div>
      <p class="wheel-explanatory-text">
        The day selected is the cutoff for all your credit transactions per billing coverage period. Your first due date will be 15 days after your billing end date.
      </p>
      <button class="set-billing-date-btn" onclick="confirmBillingSelectionStep()">Set billing end date</button>
    </div>
  `;
}

function confirmBillingSelectionStep() {
  const selectedDay = document.querySelector("#wheelScrollSelector").value || 1;
  modalRoot.innerHTML = `
    <div class="scrim" onclick="closeModal()"></div>
    <div class="sheet billing-confirm-sheet" role="dialog" aria-modal="true">
      <h2>Confirm billing end date</h2>
      <p class="muted">Your billing end date is set to:</p>
      <div class="prominent-date-display">Every ${selectedDay}${getOrdinalSuffix(parseInt(selectedDay))} of the month.</div>
      <p class="warning-text-note">Once set, you won't be able to edit it later.</p>
      <div class="dual-sheet-buttons">
        <button class="pill-btn ghost" onclick="openBillingWheelSelector()">Change</button>
        <button class="pill-btn solid" onclick="saveConfirmedBillingDate(${selectedDay})">Confirm</button>
      </div>
    </div>
  `;
}

function saveConfirmedBillingDate(day) {
  state.creditForm.billingDay = parseInt(day);
  saveState();
  closeModal();
  render();
}

function submitCreditApplication() {
  toast("Credit Approved Intelligently!");
  state.creditView = "approved"; // Advances directly to the dashboard feature
  saveState();
  render();
}

/* ==========================================================================
   NEW RECREATED APP JOURNEY: MAYA EASY CREDIT DASHBOARD MANAGEMENT
   ========================================================================== */
function renderCreditApprovedDashboard() {
  const availableCredit = state.creditLimit - state.creditUsed;
  return `
    ${topChrome()}
    <section class="credit-approved-dashboard-card">
      <div class="dashboard-header-line">
        <div>
          <div class="credit-balance-display">${money(availableCredit)}</div>
          <p class="muted-label">Available Credit Limit / ${money(state.creditLimit)}</p>
        </div>
        <span class="active-badge">ACTIVE</span>
      </div>
      <div class="credit-actions-row">
        <button class="credit-action-pill" onclick="openCreditTransferSheet()">
          <span>${icon("out")}</span> Transfer to Wallet
        </button>
      </div>
    </section>

    <h2 class="section-title">Credit Benefits</h2>
    <div class="puzzle-grid">
      <div class="puzzle-box box-1" style="background:#fff; color:#000; border:1px solid var(--line);">
        <h3 style="color:#000;">💳 Scan QR Ph to Pay</h3>
        <p>Use your available credit line seamlessly at grocery checkouts or online merchant channels.</p>
      </div>
    </div>

    <section class="panel billing-summary-panel">
      <h3>Billing Cycle Data</h3>
      <p class="muted">Cut-off date: <b>Every ${state.creditForm.billingDay || 15}${getOrdinalSuffix(state.creditForm.billingDay || 15)} of the month</b></p>
      <p class="muted">Payment Terms: 15 Days after cut-off</p>
    </section>
    ${footerCopy("Maya Easy Credit is powered by")}
  `;
}

function openCreditTransferSheet() {
  const availableCredit = state.creditLimit - state.creditUsed;
  modalRoot.className = "modal-root active";
  modalRoot.setAttribute("aria-hidden", "false");
  modalRoot.innerHTML = `
    <div class="scrim" onclick="closeModal()"></div>
    <section class="sheet" role="dialog" aria-modal="true">
      <h2>Transfer to Wallet</h2>
      <p class="muted">Draw funds out from your available credit limit line instantly.</p>
      <p class="muted" style="margin-bottom:8px;">Max available: <b>${money(availableCredit)}</b></p>
      <label class="field">Amount
        <input id="creditAmountInput" inputmode="decimal" type="number" min="1" step="0.01" placeholder="₱0.00" autofocus />
      </label>
      <div class="sheet-actions">
        <button class="pill-btn ghost" onclick="closeModal()">Cancel</button>
        <button class="pill-btn solid" onclick="executeCreditTransfer()">Transfer</button>
      </div>
    </section>
  `;
}

function executeCreditTransfer() {
  const inputAmt = Number(document.querySelector("#creditAmountInput")?.value || 0);
  const availableCredit = state.creditLimit - state.creditUsed;
  
  if (!inputAmt || inputAmt <= 0) return toast("Enter a valid amount");
  if (inputAmt > availableCredit) return toast("Exceeds available credit line limit");
  
  state.creditUsed += inputAmt;
  state.wallet += inputAmt;
  addTransaction("Credit Drawdown", "Transferred to Wallet", `+ ${peso.format(inputAmt)}`);
  
  saveState();
  closeModal();
  render();
  toast(`₱${inputAmt.toFixed(2)} transferred to wallet`);
}

/* ==========================================================================
   REST OF THE BASIC APPLICATION FRAMEWORK
   ========================================================================== */
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

function renderProfile() {
  return `
    <section class="profile-page">
      <div class="statusbar"><span>9:43</span><span class="signal"><span>▮▮▮</span><span>⌁</span><span class="battery">36</span></span></div>
      <div class="profile-head">
        <button class="back" onclick="openView('home')" aria-label="Back">‹</button>
        <h2>Profile</h2>
        <span></span>
      </div>
      <section class="profile-hero">
        <div class="profile-avatar">${icon("user")}</div>
        <h1>Juan Dela Cruz</h1>
        <p class="muted">Static account details</p>
      </section>
      <section class="profile-card">
        <div class="profile-row">
          <span>Name</span>
          <strong>Juan Dela Cruz</strong>
        </div>
        <div class="profile-row">
          <span>Phone number</span>
          <strong>+63 917 372 8852</strong>
        </div>
      </section>
      <button class="logout-btn" onclick="toast('Logged out')">Log out</button>
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
  if (state.view === "profile") {
    app.innerHTML = renderProfile();
    return;
  }
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

