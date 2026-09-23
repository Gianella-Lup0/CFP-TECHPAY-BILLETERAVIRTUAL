// ==========================================
// CONSTANTES Y CLAVES DE LOCALSTORAGE
// ==========================================

const STORAGE_KEYS = {
  BALANCE_ARS: 'techpay_saldo_ars',
  BALANCE_USD: 'techpay_saldo_usd',
  TRANSACTIONS: 'techpay_transacciones',
  CONTACTS: 'techpay_contactos',
  SERVICES: 'techpay_servicios'
};

const DEFAULT_WALLET = {
  balanceARS: 125000.50,
  balanceUSD: 102.46,
  transactions: [
    { id: '1695000000000', type: 'expense', amount: 4500, description: 'Transferencia a Camila', date: 'Hoy, 14:20' },
    { id: '1694990000000', type: 'income', amount: 25000, description: 'Dinero recibido', date: 'Hoy, 11:05' },
    { id: '1694980000000', type: 'currency', amount: 50, description: 'Compra de dólares', date: 'Ayer, 18:42' }
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

// Formato de moneda actualizado a ARS$y USD$
const formatCurrencyARS = (value) => {
  return `ARS$ ${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatCurrencyUSD = (value) => {
  return `USD$ ${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


// ==========================================
// FUNCIONALIDAD 1: MOSTRAR / OCULTAR SALDO
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

renderBalance();

if (toggleBalanceBtn) {
  toggleBalanceBtn.addEventListener('click', () => {
    isBalanceVisible = !isBalanceVisible;

    if (isBalanceVisible) {
      renderBalance();
      toggleBalanceBtn.setAttribute('aria-label', 'Ocultar saldo');
      toggleBalanceBtn.setAttribute('aria-pressed', 'false');
      if (privacyIcon) privacyIcon.textContent = '◉';
    } else {
      renderBalance();
      toggleBalanceBtn.setAttribute('aria-label', 'Mostrar saldo');
      toggleBalanceBtn.setAttribute('aria-pressed', 'true');
      if (privacyIcon) privacyIcon.textContent = '○';
    }
  });
}


// ==========================================
// FUNCIONALIDAD 2: COPIAR ALIAS Y TOAST
// ==========================================

const copyAliasBtn = document.getElementById('copy-alias');
const toastElement = document.getElementById('toast');

let toastTimeoutId = null;

function showToast(message) {
  if (!toastElement) return;

  toastElement.textContent = message;
  toastElement.classList.add('is-visible');

  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = setTimeout(() => {
    toastElement.classList.remove('is-visible');
  }, 2200);
}

if (copyAliasBtn) {
  copyAliasBtn.addEventListener('click', async () => {
    const textToCopy = copyAliasBtn.dataset.copyValue;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('¡Alias copiado al portapapeles!');
    } catch (error) {
      showToast('Error al copiar el alias');
      console.error('Error al intentar copiar:', error);
    }
  });
}


// ==========================================
// FUNCIONALIDAD 3: CONSULTA DE COTIZACIÓN (API)
// ==========================================

const exchangeStatus = document.getElementById('exchange-status');
const dollarBuy = document.getElementById('dollar-buy');
const dollarSell = document.getElementById('dollar-sell');

async function fetchDollarRates() {
  if (exchangeStatus) exchangeStatus.textContent = 'Actualizando...';

  try {
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');

    if (!response.ok) {
      throw new Error(`Respuesta no ok de la API. Status: ${response.status}`);
    }

    const data = await response.json();

    dollarRates.compra = data.compra;
    dollarRates.venta = data.venta;

    if (dollarBuy) dollarBuy.textContent = formatCurrencyARS(data.compra);
    if (dollarSell) dollarSell.textContent = formatCurrencyARS(data.venta);
    if (exchangeStatus) exchangeStatus.textContent = 'Actualizado ahora';

  } catch (error) {
    console.error('Error al obtener la cotización del dólar:', error);
    if (dollarBuy) dollarBuy.textContent = formatCurrencyARS(dollarRates.compra);
    if (dollarSell) dollarSell.textContent = formatCurrencyARS(dollarRates.venta);
    if (exchangeStatus) exchangeStatus.textContent = 'Valor de referencia';
  }
}


// ==========================================
// FUNCIONALIDAD 4: APERTURA Y CIERRE DE MODALES
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

const operationAmountInput = document.getElementById('operation-amount');
const operationDetailInput = document.getElementById('operation-detail');
const conversionHelpMsg = document.getElementById('conversion-help');
const formErrorMsg = document.getElementById('form-error');

const operationTitles = {
  income: 'Ingresar dinero',
  transfer: 'Transferir dinero',
  currency: 'Comprar dólares'
};

function openModal(operationType) {
  if (!operationModal || !modalTitle) return;
  modalTitle.textContent = operationTitles[operationType] || 'Operación';
  operationModal.dataset.operation = operationType;

  if (formErrorMsg) formErrorMsg.classList.add('is-hidden');

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
  if (formErrorMsg) formErrorMsg.classList.add('is-hidden');
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
    if (conversionHelpMsg) {
      conversionHelpMsg.textContent = `Cotización venta: ${formatCurrencyARS(dollarRates.venta)}. Ingresá un monto en ARS.`;
    }
    return;
  }

  const usdToReceive = (amountARS / dollarRates.venta).toFixed(2);
  if (conversionHelpMsg) {
    conversionHelpMsg.textContent = `Recibirás aproximadamente USD$ ${usdToReceive} (Cotización: ${formatCurrencyARS(dollarRates.venta)})`;
  }
}

if (operationAmountInput) {
  operationAmountInput.addEventListener('input', () => {
    if (operationModal && operationModal.dataset.operation === 'currency') {
      updateCurrencyCalculation();
    }
  });
}

operationCards.forEach((card) => {
  card.addEventListener('click', () => {
    const operationType = card.dataset.operation;
    openModal(operationType);
  });
});

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

if (operationModal) {
  operationModal.addEventListener('click', (event) => {
    if (event.target === operationModal) closeModal();
  });
}

if (addContactBtn) addContactBtn.addEventListener('click', openContactModal);
if (closeContactModalBtn) closeContactModalBtn.addEventListener('click', closeContactModal);

if (contactModal) {
  contactModal.addEventListener('click', (event) => {
    if (event.target === contactModal) closeContactModal();
  });
}

if (manageServicesBtn) manageServicesBtn.addEventListener('click', openServicesModal);
if (closeServicesModalBtn) closeServicesModalBtn.addEventListener('click', closeServicesModal);

if (servicesModal) {
  servicesModal.addEventListener('click', (event) => {
    if (event.target === servicesModal) closeServicesModal();
  });
}

if (closeReceiptModalBtn) closeReceiptModalBtn.addEventListener('click', closeReceiptModal);

if (receiptModal) {
  receiptModal.addEventListener('click', (event) => {
    if (event.target === receiptModal) closeReceiptModal();
  });
}

// Cierre accesible por teclado (Tecla Escape)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    closeContactModal();
    closeServicesModal();
    closeReceiptModal();
  }
});


// ==========================================
// RENDERIZADO INICIAL DE LA INTERFAZ
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
  smallDate.textContent = `${transaction.date || 'Hoy'} · ${transaction.type === 'income' ? 'Ingreso' : transaction.type === 'currency' ? 'Divisas' : 'Transferencia'}`;

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

  const avatarSpan = document.createElement('span');
  avatarSpan.className = 'contact-avatar';
  avatarSpan.textContent = contact.name.charAt(0).toUpperCase();

  const strongName = document.createElement('strong');
  strongName.textContent = contact.name;

  const smallAlias = document.createElement('small');
  smallAlias.textContent = contact.alias;

  button.appendChild(avatarSpan);
  button.appendChild(strongName);
  button.appendChild(smallAlias);

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
  if (movementsList) {
    movementsList.textContent = '';
    wallet.transactions.forEach(renderMovementUI);
  }

  if (contactsList) {
    const addCard = document.getElementById('add-contact');
    contactsList.innerHTML = '';

    wallet.contacts.forEach(contact => {
      const card = createContactCardUI(contact);
      contactsList.appendChild(card);
    });

    if (addCard) {
      contactsList.appendChild(addCard);
    }
  }

  renderServicesUI();
  filterMovements();
  fetchDollarRates();
}


// ==========================================
// FUNCIONALIDAD 5: ADMINISTRACIÓN DE SERVICIOS (ABM)
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

if (btnShowAddService) {
  btnShowAddService.addEventListener('click', () => showServiceForm());
}

if (cancelServiceBtn) {
  cancelServiceBtn.addEventListener('click', hideServiceForm);
}

if (modalServicesList) {
  modalServicesList.addEventListener('click', (event) => {
    const editBtn = event.target.closest('[data-action="edit"]');
    const deleteBtn = event.target.closest('[data-action="delete"]');

    if (editBtn) {
      const serviceId = editBtn.dataset.id;
      const service = wallet.services.find(s => s.id === serviceId);
      if (service) showServiceForm(service);
    }

    if (deleteBtn) {
      const serviceId = deleteBtn.dataset.id;
      wallet.services = wallet.services.filter(s => s.id !== serviceId);
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
// FUNCIONALIDAD 6: OPERACIONES DE SALDO
// ==========================================

const operationForm = document.getElementById('operation-form');

if (operationForm) {
  operationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const currentOperation = operationModal.dataset.operation;
    const rawAmount = operationAmountInput ? operationAmountInput.value : '';
    const amount = Number(rawAmount);

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
        amount: amount,
        description: descriptionValue || 'Ingreso de dinero',
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      wallet.transactions.push(newTransaction);
      renderMovementUI(newTransaction);
      renderBalance();
      saveWallet();
      showToast('¡Ingreso realizado con éxito!');
      closeModal();

    } else if (currentOperation === 'transfer') {
      if (!descriptionValue) {
        showToast('Ingresá una descripción o alias de destino');
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
        amount: amount,
        description: `Transferencia a ${descriptionValue}`,
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      wallet.transactions.push(newTransaction);
      renderMovementUI(newTransaction);
      renderBalance();
      saveWallet();
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
        amount: amount,
        description: `Compra de USD$ ${usdPurchased} (Cotización: ${formatCurrencyARS(dollarRates.venta)})`,
        date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      wallet.transactions.push(newTransaction);
      renderMovementUI(newTransaction);
      renderBalance();
      saveWallet();

      showToast(`¡Compraste USD$ ${usdPurchased} con éxito!`);
      closeModal();
    }
  });
}


// ==========================================
// FUNCIONALIDAD 7: GESTIÓN DE CONTACTOS
// ==========================================

const contactForm = document.getElementById('contact-form');

if (contactsList) {
  contactsList.addEventListener('click', (event) => {
    const contactCard = event.target.closest('[data-contact-alias]');

    if (contactCard && contactCard.id !== 'add-contact') {
      const alias = contactCard.dataset.contactAlias;
      openModal('transfer');

      if (operationDetailInput) {
        operationDetailInput.value = alias;
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

    const aliasExists = wallet.contacts.some(contact => contact.alias.toLowerCase() === aliasValue);

    if (aliasExists) {
      showToast('El alias ingresado ya existe en tus contactos');
      return;
    }

    const newContact = {
      id: String(Date.now()),
      name: nameValue,
      alias: aliasValue
    };

    wallet.contacts.push(newContact);

    const addCard = document.getElementById('add-contact');
    const newCard = createContactCardUI(newContact);

    if (addCard && contactsList) {
      contactsList.insertBefore(newCard, addCard);
    } else if (contactsList) {
      contactsList.appendChild(newCard);
    }

    saveWallet();
    showToast('Contacto agregado con éxito');
    closeContactModal();
  });
}


// ==========================================
// FUNCIONALIDAD 8: PAGO DE SERVICIOS
// ==========================================

if (servicesList) {
  servicesList.addEventListener('click', (event) => {
    const payBtn = event.target.closest('.pay-service');

    if (!payBtn || payBtn.disabled) return;

    const serviceItem = payBtn.closest('.service-item');
    if (!serviceItem) return;

    const serviceId = serviceItem.dataset.serviceId;
    const serviceAmount = Number(serviceItem.dataset.serviceAmount);
    const serviceNameElement = serviceItem.querySelector('.service-copy strong');
    const serviceName = serviceNameElement ? serviceNameElement.textContent : 'Servicio';

    if (isNaN(serviceAmount) || serviceAmount <= 0) {
      showToast('El importe del servicio no es válido');
      return;
    }

    if (serviceAmount > wallet.balanceARS) {
      showToast('Saldo insuficiente para pagar este servicio');
      return;
    }

    wallet.balanceARS -= serviceAmount;

    const serviceData = wallet.services.find(s => s.id === serviceId);
    if (serviceData) {
      serviceData.paid = true;
    }

    serviceItem.classList.add('is-paid');
    payBtn.disabled = true;
    payBtn.textContent = 'Pagado';

    updatePendingServicesCount();

    const newTransaction = {
      id: Date.now().toString(),
      type: 'expense',
      amount: serviceAmount,
      description: `Pago de servicio: ${serviceName}`,
      date: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    wallet.transactions.push(newTransaction);
    renderMovementUI(newTransaction);
    renderBalance();
    saveWallet();

    showToast(`¡Pago de ${serviceName} realizado con éxito!`);
  });
}


// ==========================================
// FUNCIONALIDAD 9: FILTROS Y BÚSQUEDA DINÁMICA
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
    if (visibleCount === 0) {
      noMovementsMsg.classList.remove('is-hidden');
    } else {
      noMovementsMsg.classList.add('is-hidden');
    }
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

if (searchInput) {
  searchInput.addEventListener('input', filterMovements);
}


// ==========================================
// FUNCIONALIDAD 10: COMPROBANTE DE MOVIMIENTO
// ==========================================

const receiptAmount = document.getElementById('receipt-amount');
const receiptDescription = document.getElementById('receipt-description');
const receiptId = document.getElementById('receipt-id');
const receiptStatus = document.getElementById('receipt-status');

if (movementsList) {
  movementsList.addEventListener('click', (event) => {
    const item = event.target.closest('.movement-item');

    if (!item) return;

    const amountElement = item.querySelector('.movement-amount');
    const amountText = amountElement ? amountElement.textContent : 'ARS$ 0,00';
    
    const strongTitle = item.querySelector('.movement-copy strong');
    const descriptionText = item.dataset.description || (strongTitle ? strongTitle.textContent : 'Sin descripción');
    const transactionId = item.dataset.id || `TX-${Date.now()}`;

    if (receiptAmount) receiptAmount.textContent = amountText;
    if (receiptDescription) receiptDescription.textContent = descriptionText;
    if (receiptId) receiptId.textContent = `#${transactionId}`;
    if (receiptStatus) receiptStatus.textContent = 'Completado';

    if (receiptModal) {
      receiptModal.classList.remove('is-hidden');
    }
  });
}


// ==========================================
// FUNCIONALIDAD 11: NOTIFICACIONES MODAL
// ==========================================

const notificationsData = [
  {
    id: 1,
    type: 'income',
    icon: '↓',
    title: 'Ingreso de dinero',
    message: 'Recibiste ARS$ 15.000,00 de María González.',
    time: 'Hace 10 min',
    unread: true
  },
  {
    id: 2,
    type: 'warning',
    icon: '⚠️',
    title: 'Próximo vencimiento',
    message: 'Tu servicio de Luz (Energía Sur) vence pronto.',
    time: 'Hace 2 horas',
    unread: true
  },
  {
    id: 3,
    type: 'transfer',
    icon: '↑',
    title: 'Transferencia realizada',
    message: 'Enviaste ARS$ 4.500,00 a Camila.',
    time: 'Ayer',
    unread: false
  }
];

const notificationBtn = document.getElementById('notification-btn');
const notificationsModal = document.getElementById('notifications-modal');
const closeNotificationsBtn = document.getElementById('close-notifications-modal');
const notificationsContainer = document.getElementById('notifications-container');

function renderNotifications() {
  if (!notificationsContainer) return;
  
  notificationsContainer.innerHTML = notificationsData.map(notif => `
    <div class="notification-item ${notif.unread ? 'is-unread' : ''}">
      <div class="notification-icon-box notif-type-${notif.type}">
        ${notif.icon}
      </div>
      <div class="notification-content">
        <strong>${notif.title}</strong>
        <p>${notif.message}</p>
        <span class="notification-time">${notif.time}</span>
      </div>
    </div>
  `).join('');
}

if (notificationBtn && notificationsModal) {
  notificationBtn.addEventListener('click', () => {
    renderNotifications();
    notificationsModal.classList.remove('is-hidden');
    notificationsModal.setAttribute('aria-hidden', 'false');

    const dot = notificationBtn.querySelector('.notification-dot');
    if (dot) dot.style.display = 'none';
  });
}

if (closeNotificationsBtn && notificationsModal) {
  closeNotificationsBtn.addEventListener('click', () => {
    notificationsModal.classList.add('is-hidden');
    notificationsModal.setAttribute('aria-hidden', 'true');
  });

  notificationsModal.addEventListener('click', (e) => {
    if (e.target === notificationsModal) {
      notificationsModal.classList.add('is-hidden');
      notificationsModal.setAttribute('aria-hidden', 'true');
    }
  });
}

// Carga e inicialización al arrancar la aplicación
initUI();