// ==========================================
// CONSTANTES Y CLAVES DE LOCALSTORAGE
// ==========================================

const STORAGE_KEYS = {
  BALANCE_ARS: 'techpay_saldo_ars',
  BALANCE_USD: 'techpay_saldo_usd',
  TRANSACTIONS: 'techpay_transacciones',
  CONTACTS: 'techpay_contactos',
  SERVICES: 'techpay_servicios',
  THEME: 'techpay_theme'
};

const DEFAULT_WALLET = {
  balanceARS: 125000.50,
  balanceUSD: 102.46,
  transactions: [
    { id: '1695000000000', type: 'expense', category: 'Transferencias', amount: 4500, description: 'Transferencia a Camila', date: 'Hoy, 14:20' },
    { id: '1694990000000', type: 'income', category: 'Otros', amount: 25000, description: 'Dinero recibido', date: 'Hoy, 11:05' },
    { id: '1694980000000', type: 'expense', category: 'Servicios', amount: 8900, description: 'Pago de Celular', date: 'Ayer, 18:42' },
    { id: '1694970000000', type: 'expense', category: 'Compras', amount: 15400, description: 'Supermercado', date: 'Ayer, 12:15' }
  ],
  contacts: [
    { id: '1', name: 'Lucas', alias: 'lucas.dev' },
    { id: '2', name: 'Camila', alias: 'camila.ui' },
    { id: '3', name: 'Mateo', alias: 'mateo.design' },
    { id: '4', name: 'Sofía', alias: 'sofia.crea' }
  ],
  services: [
    { id: 'electricity', name: 'Energía Sur', amount: 18500, dueDate: 'Vence el 22 Sep', paid: false, logoClass: 'service-electricity', logoIcon: '⚡' },
    { id: 'internet', name: 'FibraNet', amount: 12400, dueDate: 'Vence el 25 Sep', paid: false, logoClass: 'service-internet', logoIcon: '◉' },
    { id: 'phone', name: 'Celular Móvil', amount: 8900, dueDate: 'Vence el 28 Sep', paid: false, logoClass: 'service-phone', logoIcon: '⌁' }
  ]
};

let expensesChart = null;
let html5QrCodeScanner = null;


// ==========================================
// FUNCIONALIDAD PROPUESTA 1: THEME TOGGLE
// ==========================================

const themeToggleBtn = document.getElementById('theme-toggle-btn');

function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', initialTheme);
  updateThemeIcon(initialTheme);
}

function updateThemeIcon(theme) {
  if (themeToggleBtn) {
    themeToggleBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);

    if (expensesChart) {
      renderExpensesChart(); // Re-renderizar para ajustar paletas
    }
  });
}


// ==========================================
// FUNCIONES DE PERSISTENCIA (LOCALSTORAGE)
// ==========================================

function loadWallet() {
  try {
    const savedBalanceARS = localStorage.getItem(STORAGE_KEYS.BALANCE_ARS);
    const savedBalanceUSD = localStorage.getItem(STORAGE_KEYS.BALANCE_USD);
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const savedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    const savedServices = localStorage.getItem(STORAGE_KEYS.SERVICES);

    return {
      balanceARS: savedBalanceARS !== null ? Number(savedBalanceARS) : DEFAULT_WALLET.balanceARS,
      balanceUSD: savedBalanceUSD !== null ? Number(savedBalanceUSD) : DEFAULT_WALLET.balanceUSD,
      transactions: savedTransactions ? JSON.parse(savedTransactions) : DEFAULT_WALLET.transactions,
      contacts: savedContacts ? JSON.parse(savedContacts) : DEFAULT_WALLET.contacts,
      services: savedServices ? JSON.parse(savedServices) : DEFAULT_WALLET.services
    };
  } catch (error) {
    console.error('Error al cargar datos desde localStorage:', error);
    return { ...DEFAULT_WALLET };
  }
}

function saveWallet() {
  try {
    localStorage.setItem(STORAGE_KEYS.BALANCE_ARS, wallet.balanceARS);
    localStorage.setItem(STORAGE_KEYS.BALANCE_USD, wallet.balanceUSD);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(wallet.transactions));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(wallet.contacts));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(wallet.services));
  } catch (error) {
    console.error('Error al guardar datos en localStorage:', error);
  }
}


// ==========================================
// ESTADO DE LA APLICACIÓN Y FORMATO DE MONEDA
// ==========================================

const wallet = loadWallet();

let dollarRates = {
  compra: 1180,
  venta: 1220
};

const formatCurrencyARS = (value) => {
  return `ARS$ ${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatCurrencyUSD = (value) => {
  return `USD$ ${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


// ==========================================
// MOSTRAR / OCULTAR SALDO & TOAST
// ==========================================

const balanceTitle = document.getElementById('balance-title');
const balanceUsd = document.getElementById('balance-usd');
const toggleBalanceBtn = document.getElementById('toggle-balance');
const privacyIcon = document.getElementById('privacy-icon');

let isBalanceVisible = true;

function renderBalance() {
  if (!balanceTitle || !balanceUsd) return;

  if (isBalanceVisible) {
    balanceTitle.textContent = formatCurrencyARS(wallet.balanceARS);
    balanceUsd.textContent = formatCurrencyUSD(wallet.balanceUSD);
  } else {
    balanceTitle.textContent = 'ARS$ ••••••••';
    balanceUsd.textContent = 'USD$ ••••••••';
  }
}

if (toggleBalanceBtn) {
  toggleBalanceBtn.addEventListener('click', () => {
    isBalanceVisible = !isBalanceVisible;
    renderBalance();
    toggleBalanceBtn.setAttribute('aria-pressed', !isBalanceVisible);
    if (privacyIcon) privacyIcon.textContent = isBalanceVisible ? '◉' : '○';
  });
}

const copyAliasBtn = document.getElementById('copy-alias');
const toastElement = document.getElementById('toast');
let toastTimeoutId = null;

function showToast(message) {
  if (!toastElement) return;

  toastElement.textContent = message;
  toastElement.classList.add('is-visible');

  if (toastTimeoutId) clearTimeout(toastTimeoutId);

  toastTimeoutId = setTimeout(() => {
    toastElement.classList.remove('is-visible');
  }, 2200);
}

if (copyAliasBtn) {
  copyAliasBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyAliasBtn.dataset.copyValue);
      showToast('¡Alias copiado al portapapeles!');
    } catch (error) {
      showToast('Error al copiar el alias');
    }
  });
}


// ==========================================
// CONSULTA DE COTIZACIÓN (API)
// ==========================================

const exchangeStatus = document.getElementById('exchange-status');
const dollarBuy = document.getElementById('dollar-buy');
const dollarSell = document.getElementById('dollar-sell');

async function fetchDollarRates() {
  if (exchangeStatus) exchangeStatus.textContent = 'Actualizando...';

  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
    if (!response.ok) throw new Error('Error al conectar con API');

    const data = await response.json();
    dollarRates.compra = data.compra;
    dollarRates.venta = data.venta;

    if (dollarBuy) dollarBuy.textContent = formatCurrencyARS(data.compra);
    if (dollarSell) dollarSell.textContent = formatCurrencyARS(data.venta);
    if (exchangeStatus) exchangeStatus.textContent = 'Actualizado ahora';

  } catch (error) {
    if (dollarBuy) dollarBuy.textContent = formatCurrencyARS(dollarRates.compra);
    if (dollarSell) dollarSell.textContent = formatCurrencyARS(dollarRates.venta);
    if (exchangeStatus) exchangeStatus.textContent = 'Valor de referencia';
  }
}


// ==========================================
// MODALES Y NAVEGACIÓN
// ==========================================

const operationCards = document.querySelectorAll('[data-operation]');
const operationModal = document.getElementById('operation-modal');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');

const contactModal = document.getElementById('contact-modal');
const addContactBtn = document.getElementById('add-contact');
const closeContactModalBtn = document.getElementById('close-contact-modal');

const receiptModal = document.getElementById('receipt-modal');
const closeReceiptModalBtn = document.getElementById('close-receipt-modal');

const servicesModal = document.getElementById('services-modal');
const manageServicesBtn = document.getElementById('manage-services');
const closeServicesModalBtn = document.getElementById('close-services-modal');

const qrModal = document.getElementById('qr-modal');
const openQrModalBtn = document.getElementById('open-qr-modal-btn');
const closeQrModalBtn = document.getElementById('close-qr-modal');

const operationAmountInput = document.getElementById('operation-amount');
const operationDetailInput = document.getElementById('operation-detail');
const conversionHelpMsg = document.getElementById('conversion-help');
const recipientInfo = document.getElementById('recipient-info');

const operationTitles = {
  income: 'Ingresar dinero',
  transfer: 'Transferir dinero',
  currency: 'Comprar dólares'
};

function openModal(operationType) {
  if (!operationModal || !modalTitle) return;
  modalTitle.textContent = operationTitles[operationType] || 'Operación';
  operationModal.dataset.operation = operationType;

  if (recipientInfo) recipientInfo.classList.add('is-hidden');

  if (operationType === 'currency') {
    if (conversionHelpMsg) conversionHelpMsg.classList.remove('is-hidden');
    updateCurrencyCalculation();
  } else {
    if (conversionHelpMsg) conversionHelpMsg.classList.add('is-hidden');
    if (operationDetailInput) operationDetailInput.value = '';
  }

  operationModal.classList.remove('is-hidden');
}

function closeModal() {
  if (operationModal) operationModal.classList.add('is-hidden');
  const form = document.getElementById('operation-form');
  if (form) form.reset();
  if (conversionHelpMsg) conversionHelpMsg.classList.add('is-hidden');
  if (recipientInfo) recipientInfo.classList.add('is-hidden');
}

function openContactModal() {
  if (contactModal) contactModal.classList.remove('is-hidden');
}

function closeContactModal() {
  if (contactModal) {
    contactModal.classList.add('is-hidden');
    const form = document.getElementById('contact-form');
    if (form) form.reset();
  }
}

function closeReceiptModal() {
  if (receiptModal) receiptModal.classList.add('is-hidden');
}

function openServicesModal() {
  if (servicesModal) {
    renderModalServicesList();
    servicesModal.classList.remove('is-hidden');
  }
}

function closeServicesModal() {
  if (servicesModal) {
    servicesModal.classList.add('is-hidden');
    hideServiceForm();
  }
}

function updateCurrencyCalculation() {
  if (operationModal.dataset.operation !== 'currency' || !operationAmountInput) return;

  const amountARS = Number(operationAmountInput.value);
  if (!amountARS || amountARS <= 0) {
    if (conversionHelpMsg) conversionHelpMsg.textContent = `Cotización venta: ${formatCurrencyARS(dollarRates.venta)}. Ingresá un monto en ARS.`;
    return;
  }

  const usdToReceive = (amountARS / dollarRates.venta).toFixed(2);
  if (conversionHelpMsg) {
    conversionHelpMsg.textContent = `Recibirás aproximadamente USD$ ${usdToReceive} (Cotización: ${formatCurrencyARS(dollarRates.venta)})`;
  }
}

if (operationAmountInput) {
  operationAmountInput.addEventListener('input', updateCurrencyCalculation);
}

operationCards.forEach((card) => {
  card.addEventListener('click', () => openModal(card.dataset.operation));
});

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (addContactBtn) addContactBtn.addEventListener('click', openContactModal);
if (closeContactModalBtn) closeContactModalBtn.addEventListener('click', closeContactModal);
if (manageServicesBtn) manageServicesBtn.addEventListener('click', openServicesModal);
if (closeServicesModalBtn) closeServicesModalBtn.addEventListener('click', closeServicesModal);
if (closeReceiptModalBtn) closeReceiptModalBtn.addEventListener('click', closeReceiptModal);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    closeContactModal();
    closeServicesModal();
    closeReceiptModal();
    closeQrModal();
  }
});


// ==========================================
// FUNCIONALIDAD PROPUESTA 2: COBRAR Y PAGAR QR
// ==========================================

const qrGenTab = document.getElementById('qr-gen-tab');
const qrScanTab = document.getElementById('qr-scan-tab');
const qrGenSection = document.getElementById('qr-generator-section');
const qrScanSection = document.getElementById('qr-scanner-section');

function generateQRCode() {
  const container = document.getElementById('qrcode-container');
  if (!container) return;

  container.innerHTML = '';
  new QRCode(container, {
    text: `techpay://pay?alias=techpay.sergio`,
    width: 160,
    height: 160,
    colorDark: '#0f172a',
    colorLight: '#ffffff'
  });
}

function startQRScanner() {
  stopQRScanner(); // Detiene cualquier instancia previa

  const qrReaderContainer = document.getElementById("qr-reader");
  if (qrReaderContainer) {
    qrReaderContainer.innerHTML = ""; // Limpia el contenedor
  }

  html5QrCodeScanner = new Html5Qrcode("qr-reader");
  html5QrCodeScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 200, height: 200 } },
    (decodedText) => {
      stopQRScanner();
      closeQrModal();
      openModal('transfer');
      if (operationDetailInput) {
        operationDetailInput.value = decodedText.replace('techpay://pay?alias=', '');
        validateRecipientInput();
      }
      showToast('QR Escaneado con éxito');
    },
    (errorMessage) => {
      // Ignorar errores cuadro por cuadro
    }
  ).catch(err => {
    console.warn("No se pudo iniciar la cámara o falta permiso.", err);
  });
}

function stopQRScanner() {
  if (html5QrCodeScanner) {
    html5QrCodeScanner.stop().then(() => {
      html5QrCodeScanner.clear();
      html5QrCodeScanner = null;
    }).catch(err => {
      console.warn("Lector detenido previamente o no activo:", err);
      html5QrCodeScanner = null;
    });
  }
}

if (openQrModalBtn) {
  openQrModalBtn.addEventListener('click', () => {
    if (qrModal) {
      qrModal.classList.remove('is-hidden');
      generateQRCode();
    }
  });
}

function closeQrModal() {
  if (qrModal) {
    qrModal.classList.add('is-hidden');
    stopQRScanner();
  }
}

if (closeQrModalBtn) closeQrModalBtn.addEventListener('click', closeQrModal);

if (qrGenTab && qrScanTab) {
  qrGenTab.addEventListener('click', () => {
    qrGenTab.classList.add('is-active');
    qrScanTab.classList.remove('is-active');
    qrGenSection.classList.remove('is-hidden');
    qrScanSection.classList.add('is-hidden');
    stopQRScanner();
  });

  qrScanTab.addEventListener('click', () => {
    qrScanTab.classList.add('is-active');
    qrGenTab.classList.remove('is-active');
    qrScanSection.classList.remove('is-hidden');
    qrGenSection.classList.add('is-hidden');
    startQRScanner();
  });
}


// ==========================================
// FUNCIONALIDAD PROPUESTA 3: GRÁFICO ESTADÍSTICO
// ==========================================

function renderExpensesChart() {
  const ctx = document.getElementById('expenses-chart');
  if (!ctx) return;

  const categoryTotals = {
    Servicios: 0,
    Transferencias: 0,
    Compras: 0,
    Otros: 0
  };

  wallet.transactions.forEach(t => {
    if (t.type === 'expense') {
      const cat = t.category || 'Otros';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (expensesChart) expensesChart.destroy();

  expensesChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: ['#eab308', '#3b82f6', '#ef4444', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim()
          }
        }
      }
    }
  });
}


// ==========================================
// FUNCIONALIDAD PROPUESTA 4: VALIDACIÓN REGEX CBU / ALIAS
// ==========================================

function validateRecipientInput() {
  if (!operationDetailInput || !recipientInfo) return;

  const value = operationDetailInput.value.trim();
  const cbuRegex = /^\d{22}$/;
  const aliasRegex = /^[a-zA-Z0-9]{3,}\.[a-zA-Z0-9]{3,}\.[a-zA-Z0-9]{3,}$/;

  if (cbuRegex.test(value)) {
    recipientInfo.textContent = '✓ CBU/CVU Válido (Destinatario Ficticio: Juan Pérez)';
    recipientInfo.classList.remove('is-hidden');
  } else if (aliasRegex.test(value)) {
    recipientInfo.textContent = '✓ Alias Válido (Destinatario Ficticio: María Gómez)';
    recipientInfo.classList.remove('is-hidden');
  } else {
    recipientInfo.classList.add('is-hidden');
  }
}

if (operationDetailInput) {
  operationDetailInput.addEventListener('input', validateRecipientInput);
}


// ==========================================
// RENDERIZADO GENERAL Y MOVIMIENTOS
// ==========================================

const movementsList = document.getElementById('movements-list');
const contactsList = document.getElementById('contacts-list');
const servicesList = document.getElementById('services-list');
const pendingServicesCount = document.getElementById('pending-services-count');

function renderMovementUI(transaction) {
  if (!movementsList) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'movement-item';
  button.dataset.id = transaction.id;
  button.dataset.type = transaction.type;
  button.dataset.description = transaction.description;

  const iconSpan = document.createElement('span');
  iconSpan.setAttribute('aria-hidden', 'true');

  if (transaction.type === 'income') {
    iconSpan.className = 'movement-icon movement-income';
    iconSpan.textContent = '↓';
  } else if (transaction.type === 'currency') {
    iconSpan.className = 'movement-icon movement-currency';
    iconSpan.textContent = '$';
  } else {
    iconSpan.className = 'movement-icon movement-transfer';
    iconSpan.textContent = '↗';
  }

  const copySpan = document.createElement('span');
  copySpan.className = 'movement-copy';

  const strongTitle = document.createElement('strong');
  strongTitle.textContent = transaction.description;

  const smallDate = document.createElement('small');
  smallDate.textContent = `${transaction.date || 'Hoy'} · ${transaction.category || 'General'}`;

  copySpan.appendChild(strongTitle);
  copySpan.appendChild(smallDate);

  const amountSpan = document.createElement('span');
  if (transaction.type === 'income') {
    amountSpan.className = 'movement-amount amount-income';
    amountSpan.textContent = `+ ${formatCurrencyARS(transaction.amount)}`;
  } else {
    amountSpan.className = 'movement-amount amount-expense';
    amountSpan.textContent = `− ${formatCurrencyARS(transaction.amount)}`;
  }

  button.appendChild(iconSpan);
  button.appendChild(copySpan);
  button.appendChild(amountSpan);

  movementsList.prepend(button);
  filterMovements();
}

function createContactCardUI(contact) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'contact-card';
  button.dataset.contactId = contact.id;
  button.dataset.contactName = contact.name;
  button.dataset.contactAlias = contact.alias;

  button.innerHTML = `
    <span class="contact-avatar">${contact.name.charAt(0).toUpperCase()}</span>
    <strong>${contact.name}</strong>
    <small>${contact.alias}</small>
  `;

  return button;
}

function updatePendingServicesCount() {
  if (!servicesList || !pendingServicesCount) return;
  const pendingItems = wallet.services.filter(service => !service.paid);
  pendingServicesCount.textContent = pendingItems.length;
}

function renderServicesUI() {
  if (!servicesList) return;

  servicesList.innerHTML = '';
  wallet.services.forEach(service => {
    const article = document.createElement('article');
    article.className = `service-item ${service.paid ? 'is-paid' : ''}`;
    article.dataset.serviceId = service.id;
    article.dataset.serviceAmount = service.amount;

    article.innerHTML = `
      <span class="service-logo ${service.logoClass || 'service-electricity'}">${service.logoIcon || '⚡'}</span>
      <span class="service-copy">
        <strong>${service.name}</strong>
        <small>${service.dueDate || 'Pendiente'}</small>
      </span>
      <span class="service-action">
        <strong>${formatCurrencyARS(service.amount)}</strong>
        <button class="small-button pay-service" type="button" ${service.paid ? 'disabled' : ''}>
          ${service.paid ? 'Pagado' : 'Pagar'}
        </button>
      </span>
    `;

    servicesList.appendChild(article);
  });

  updatePendingServicesCount();
}

function initUI() {
  initTheme();
  renderBalance();

  if (movementsList) {
    movementsList.textContent = '';
    wallet.transactions.forEach(renderMovementUI);
  }

  if (contactsList) {
    const addCard = document.getElementById('add-contact');
    contactsList.innerHTML = '';
    wallet.contacts.forEach(contact => contactsList.appendChild(createContactCardUI(contact)));
    if (addCard) contactsList.appendChild(addCard);
  }

  renderServicesUI();
  filterMovements();
  fetchDollarRates();
  renderExpensesChart();
}


// ==========================================
// ADMINISTRACIÓN DE SERVICIOS (ABM)
// ==========================================

const modalServicesList = document.getElementById('modal-services-list');
const btnShowAddService = document.getElementById('btn-show-add-service');
const serviceForm = document.getElementById('service-form');
const serviceFormTitle = document.getElementById('service-form-title');
const serviceEditId = document.getElementById('service-edit-id');
const serviceNameInput = document.getElementById('service-name-input');
const serviceAmountInput = document.getElementById('service-amount-input');
const serviceDueDateInput = document.getElementById('service-dueDate-input');
const cancelServiceBtn = document.getElementById('cancel-service-btn');

function renderModalServicesList() {
  if (!modalServicesList) return;

  modalServicesList.innerHTML = '';
  if (wallet.services.length === 0) {
    modalServicesList.innerHTML = '<p style="font-size: 12px; color: var(--text-muted); text-align: center;">No tenés servicios agregados.</p>';
    return;
  }

  wallet.services.forEach(service => {
    const item = document.createElement('div');
    item.className = 'modal-service-item';

    item.innerHTML = `
      <div class="modal-service-info">
        <strong>${service.name} ${service.paid ? '(Pagado)' : ''}</strong>
        <small>${formatCurrencyARS(service.amount)} · ${service.dueDate || 'Sin fecha'}</small>
      </div>
      <div class="service-actions-group">
        <button class="edit-button" type="button" data-action="edit" data-id="${service.id}">Editar</button>
        <button class="danger-button" type="button" data-action="delete" data-id="${service.id}">Eliminar</button>
      </div>
    `;

    modalServicesList.appendChild(item);
  });
}

function showServiceForm(serviceToEdit = null) {
  if (!serviceForm) return;

  if (serviceToEdit) {
    if (serviceFormTitle) serviceFormTitle.textContent = 'Editar servicio';
    if (serviceEditId) serviceEditId.value = serviceToEdit.id;
    if (serviceNameInput) serviceNameInput.value = serviceToEdit.name;
    if (serviceAmountInput) serviceAmountInput.value = serviceToEdit.amount;
    if (serviceDueDateInput) serviceDueDateInput.value = serviceToEdit.dueDate || '';
  } else {
    if (serviceFormTitle) serviceFormTitle.textContent = 'Nuevo servicio';
    if (serviceEditId) serviceEditId.value = '';
    serviceForm.reset();
  }

  serviceForm.classList.remove('is-hidden');
}

function hideServiceForm() {
  if (serviceForm) {
    serviceForm.classList.add('is-hidden');
    serviceForm.reset();
  }
}

if (btnShowAddService) btnShowAddService.addEventListener('click', () => showServiceForm());
if (cancelServiceBtn) cancelServiceBtn.addEventListener('click', hideServiceForm);

if (modalServicesList) {
  modalServicesList.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-action="edit"]');
    const deleteBtn = event.target.closest('[data-action="delete"]');

    if (editBtn) {
      const service = wallet.services.find(s => s.id === editBtn.dataset.id);
      if (service) showServiceForm(service);
    }

    if (deleteBtn) {
      wallet.services = wallet.services.filter(s => s.id !== deleteBtn.dataset.id);
      saveWallet();
      renderModalServicesList();
      renderServicesUI();
      showToast('Servicio eliminado con éxito');
    }
  });
}

if (serviceForm) {
  serviceForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const editId = serviceEditId ? serviceEditId.value : '';
    const name = serviceNameInput ? serviceNameInput.value.trim() : '';
    const amount = serviceAmountInput ? Number(serviceAmountInput.value) : 0;
    const dueDate = serviceDueDateInput && serviceDueDateInput.value.trim() ? serviceDueDateInput.value.trim() : 'Pendiente';

    if (!name || isNaN(amount) || amount <= 0) {
      showToast('Ingresá un nombre y un monto válido');
      return;
    }

    if (editId) {
      const serviceIndex = wallet.services.findIndex(s => s.id === editId);
      if (serviceIndex !== -1) {
        wallet.services[serviceIndex].name = name;
        wallet.services[serviceIndex].amount = amount;
        wallet.services[serviceIndex].dueDate = dueDate;
        showToast('Servicio actualizado con éxito');
      }
    } else {
      const newService = {
        id: 'srv-' + Date.now(),
        name: name,
        amount: amount,
        dueDate: dueDate,
        paid: false,
        logoClass: 'service-electricity',
        logoIcon: '⚡'
      };
      wallet.services.push(newService);
      showToast('Servicio agregado con éxito');
    }

    saveWallet();
    renderModalServicesList();
    renderServicesUI();
    hideServiceForm();
  });
}


// ==========================================
// OPERACIONES DE SALDO
// ==========================================

const operationForm = document.getElementById('operation-form');

if (operationForm) {
  operationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const currentOperation = operationModal.dataset.operation;
    const amount = Number(operationAmountInput ? operationAmountInput.value : '');
    const categorySelect = document.getElementById('operation-category');
    const selectedCategory = categorySelect ? categorySelect.value : 'Otros';

    if (isNaN(amount) || amount <= 0) {
      showToast('Ingresá un monto válido mayor a 0');
      return;
    }

    const descriptionValue = operationDetailInput ? operationDetailInput.value.trim() : '';

    if (currentOperation === 'income') {
      wallet.balanceARS += amount;

      const newTransaction = {
        id: Date.now().toString(),
        type: 'income',
        category: selectedCategory,
        amount: amount,
        description: descriptionValue || 'Ingreso de dinero',
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      wallet.transactions.push(newTransaction);
      renderMovementUI(newTransaction);
      renderBalance();
      saveWallet();
      renderExpensesChart();
      showToast('¡Ingreso realizado con éxito!');
      closeModal();

    } else if (currentOperation === 'transfer') {
      if (!descriptionValue) {
        showToast('Ingresá una descripción, CBU/CVU o alias');
        return;
      }

      if (amount > wallet.balanceARS) {
        showToast('Saldo insuficiente para realizar la transferencia');
        return;
      }

      wallet.balanceARS -= amount;

      const newTransaction = {
        id: Date.now().toString(),
        type: 'expense',
        category: selectedCategory,
        amount: amount,
        description: `Transferencia a ${descriptionValue}`,
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      wallet.transactions.push(newTransaction);
      renderMovementUI(newTransaction);
      renderBalance();
      saveWallet();
      renderExpensesChart();
      showToast('¡Transferencia enviada con éxito!');
      closeModal();

    } else if (currentOperation === 'currency') {
      if (amount > wallet.balanceARS) {
        showToast('Saldo insuficiente en ARS para comprar dólares');
        return;
      }

      const usdPurchased = Number((amount / dollarRates.venta).toFixed(2));

      wallet.balanceARS -= amount;
      wallet.balanceUSD += usdPurchased;

      const newTransaction = {
        id: Date.now().toString(),
        type: 'currency',
        category: 'Divisas',
        amount: amount,
        description: `Compra de USD$ ${usdPurchased} (Cotización: ${formatCurrencyARS(dollarRates.venta)})`,
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      wallet.transactions.push(newTransaction);
      renderMovementUI(newTransaction);
      renderBalance();
      saveWallet();
      renderExpensesChart();

      showToast(`¡Compraste USD$ ${usdPurchased} con éxito!`);
      closeModal();
    }
  });
}


// ==========================================
// GESTIÓN DE CONTACTOS Y SERVICIOS
// ==========================================

const contactForm = document.getElementById('contact-form');

if (contactsList) {
  contactsList.addEventListener('click', (event) => {
    const contactCard = event.target.closest('[data-contact-alias]');
    if (contactCard && contactCard.id !== 'add-contact') {
      openModal('transfer');
      if (operationDetailInput) {
        operationDetailInput.value = contactCard.dataset.contactAlias;
        validateRecipientInput();
      }
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameInput = document.getElementById('contact-name');
    const aliasInput = document.getElementById('contact-alias');
    const nameValue = nameInput ? nameInput.value.trim() : '';
    const aliasValue = aliasInput ? aliasInput.value.trim().toLowerCase() : '';

    if (!nameValue || !aliasValue) {
      showToast('Por favor, completá todos los campos');
      return;
    }

    if (wallet.contacts.some(c => c.alias.toLowerCase() === aliasValue)) {
      showToast('El alias ingresado ya existe en tus contactos');
      return;
    }

    const newContact = { id: String(Date.now()), name: nameValue, alias: aliasValue };
    wallet.contacts.push(newContact);

    const addCard = document.getElementById('add-contact');
    const newCard = createContactCardUI(newContact);

    if (addCard && contactsList) contactsList.insertBefore(newCard, addCard);
    else if (contactsList) contactsList.appendChild(newCard);

    saveWallet();
    showToast('Contacto agregado con éxito');
    closeContactModal();
  });
}

if (servicesList) {
  servicesList.addEventListener('click', (event) => {
    const payBtn = event.target.closest('.pay-service');
    if (!payBtn || payBtn.disabled) return;

    const serviceItem = payBtn.closest('.service-item');
    if (!serviceItem) return;

    const serviceId = serviceItem.dataset.serviceId;
    const serviceAmount = Number(serviceItem.dataset.serviceAmount);
    const serviceName = serviceItem.querySelector('.service-copy strong').textContent;

    if (serviceAmount > wallet.balanceARS) {
      showToast('Saldo insuficiente para pagar este servicio');
      return;
    }

    wallet.balanceARS -= serviceAmount;
    const serviceData = wallet.services.find(s => s.id === serviceId);
    if (serviceData) serviceData.paid = true;

    serviceItem.classList.add('is-paid');
    payBtn.disabled = true;
    payBtn.textContent = 'Pagado';

    updatePendingServicesCount();

    const newTransaction = {
      id: Date.now().toString(),
      type: 'expense',
      category: 'Servicios',
      amount: serviceAmount,
      description: `Pago de servicio: ${serviceName}`,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    wallet.transactions.push(newTransaction);
    renderMovementUI(newTransaction);
    renderBalance();
    saveWallet();
    renderExpensesChart();

    showToast(`¡Pago de ${serviceName} realizado con éxito!`);
  });
}


// ==========================================
// FILTROS, COMPROBANTE Y NOTIFICACIONES
// ==========================================

const filterTabs = document.querySelectorAll('[data-filter]');
const searchInput = document.getElementById('movement-search');
const noMovementsMsg = document.getElementById('no-movements');

let activeFilter = 'all';

function filterMovements() {
  if (!movementsList) return;

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const items = movementsList.querySelectorAll('.movement-item');
  let visibleCount = 0;

  items.forEach(item => {
    const itemType = item.dataset.type || '';
    const itemDescription = (item.dataset.description || '').toLowerCase();

    const matchesType = (activeFilter === 'all') || (itemType === activeFilter);
    const matchesQuery = (query === '') || itemDescription.includes(query);

    if (matchesType && matchesQuery) {
      item.classList.remove('is-hidden');
      visibleCount++;
    } else {
      item.classList.add('is-hidden');
    }
  });

  if (noMovementsMsg) {
    noMovementsMsg.classList.toggle('is-hidden', visibleCount > 0);
  }
}

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activeFilter = tab.dataset.filter;
    filterTabs.forEach(t => {
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('is-active');
    tab.setAttribute('aria-selected', 'true');
    filterMovements();
  });
});

if (searchInput) searchInput.addEventListener('input', filterMovements);

if (movementsList) {
  movementsList.addEventListener('click', (event) => {
    const item = event.target.closest('.movement-item');
    if (!item) return;

    const receiptAmount = document.getElementById('receipt-amount');
    const receiptDescription = document.getElementById('receipt-description');
    const receiptId = document.getElementById('receipt-id');

    if (receiptAmount) receiptAmount.textContent = item.querySelector('.movement-amount').textContent;
    if (receiptDescription) receiptDescription.textContent = item.dataset.description;
    if (receiptId) receiptId.textContent = `#${item.dataset.id}`;

    if (receiptModal) receiptModal.classList.remove('is-hidden');
  });
}

// Inicialización de Notificaciones
const notificationsData = [
  { id: 1, type: 'income', icon: '↓', title: 'Ingreso de dinero', message: 'Recibiste ARS$ 15.000,00 de María González.', time: 'Hace 10 min', unread: true },
  { id: 2, type: 'warning', icon: '⚠️', title: 'Próximo vencimiento', message: 'Tu servicio de Luz (Energía Sur) vence pronto.', time: 'Hace 2 horas', unread: true }
];

const notificationBtn = document.getElementById('notification-btn');
const notificationsModal = document.getElementById('notifications-modal');
const closeNotificationsBtn = document.getElementById('close-notifications-modal');
const notificationsContainer = document.getElementById('notifications-container');

if (notificationBtn && notificationsModal) {
  notificationBtn.addEventListener('click', () => {
    if (notificationsContainer) {
      notificationsContainer.innerHTML = notificationsData.map(n => `
        <div class="notification-item ${n.unread ? 'is-unread' : ''}">
          <div class="notification-icon-box notif-type-${n.type}">${n.icon}</div>
          <div class="notification-content">
            <strong>${n.title}</strong>
            <p>${n.message}</p>
            <span class="notification-time">${n.time}</span>
          </div>
        </div>
      `).join('');
    }
    notificationsModal.classList.remove('is-hidden');
    const dot = notificationBtn.querySelector('.notification-dot');
    if (dot) dot.style.display = 'none';
  });
}

if (closeNotificationsBtn && notificationsModal) {
  closeNotificationsBtn.addEventListener('click', () => notificationsModal.classList.add('is-hidden'));
}

// Inicializar la App al cargar los scripts
initUI();