import * as initial from './initial.js';
import * as dashboard from './dashboard.js';

// ==========================================
// 3. MÓDULO DE CARTERAS (WALLETS)
// ==========================================

export function renderWallets() {
    const container = document.getElementById('wallets-container');
    const headerNewWalletBtn = document.getElementById('headerNewWalletBtn');
    
    if (!container) return;

    if (initial.userWallets.length === 0) {
        if (headerNewWalletBtn) headerNewWalletBtn.style.display = 'none';
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="p-4 d-inline-block" style="border-radius: 16px;">
                    <i class="fas fa-wallet fa-3x text-muted mb-3"></i>
                    <h5 class="fw-bold text-muted">No tienes carteras registradas</h5>
                    <p class="text-muted small mb-3">Crea tu primera cuenta para comenzar a organizar tu dinero.</p>
                    <button class="btn btn-sm btn-primary px-3 py-2" style="border-radius: 10px;" data-bs-toggle="modal" data-bs-target="#addWalletModal">
                        <i class="fas fa-plus me-2"></i>Crear Cartera
                    </button>
                </div>
            </div>`;
        return;
    } else {
        if (headerNewWalletBtn) headerNewWalletBtn.style.display = '';
    }

    let html = '';

    initial.userWallets.forEach(wallet => {
        const formattedBalance = wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const balanceColorClass = wallet.balance <= 0 ? 'text-danger' : '';
        const badgeAffects = wallet.affectsBalance 
            ? `<span class="badge bg-success bg-opacity-10 text-success px-2 py-1"><i class="fas fa-check-circle me-1"></i>Afecta Balance</span>`
            : `<span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1"><i class="fas fa-times-circle me-1"></i>No Afecta Balance</span>`;


        html += `
            <div class="col-md-6 col-xl-4">
                <div class="glass p-4 h-100 d-flex flex-column justify-content-between position-relative">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 text-primary rounded p-3 me-3 fs-4">
                                    <i class="${wallet.icon}"></i>
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-1 flex-wrap mb-1 me-2">
                                        <h6 class="fw-bold mb-0">${wallet.title}</h6>
                                    </div>
                                    ${badgeAffects}
                                </div>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-exclamation-circle text-muted me-2" style="cursor:help;" data-bs-toggle="tooltip" data-bs-placement="top" title="${wallet.desc || 'Sin descripción provista'}"></i>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                        <li><button class="dropdown-item py-2 btnOpenEditWallet" data-id=${wallet.id}><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                        <li><button class="dropdown-item py-2 text-danger btnDeleteWallet" data-id=${wallet.id}><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="mb-1 pb-2 border-secondary d-flex justify-content-between align-items-center" style="border-opacity: 0.1;">
                            <div>
                                <span class="text-muted text-small small d-block mb-1">Balance Actual</span>
                                <h5 class="fw-bold mb-0 ${balanceColorClass}">$${formattedBalance}</h5>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-outline-secondary px-2 py-1 mt-1 btnViewMovements" style="border-radius:8px;" data-id=${wallet.id}>
                            <i class="fas fa-list-alt me-1"></i>Ver Movimientos
                        </button>
                    </div>
                </div>
            </div>`;
    });

    
    container.innerHTML = html;

    container.querySelectorAll('.btnViewMovements').forEach(btnViewMovements => {
        btnViewMovements.addEventListener('click', () => {
            openWalletMovementsPage(btnViewMovements.getAttribute('data-id'));
        });
    });
    container.querySelectorAll('.btnOpenEditWallet').forEach(btnOpenEditWallet => {
        btnOpenEditWallet.addEventListener('click', () => {
            openEditWalletModal(btnOpenEditWallet.getAttribute('data-id'));
        });
    });
    container.querySelectorAll('.btnDeleteWallet').forEach(btnDeleteWallet => {
        btnDeleteWallet.addEventListener('click', () => {
            confirmDeleteWallet(btnDeleteWallet.getAttribute('data-id'));
        });
    });

    initial.reinitTooltips();
}

let activeWalletForMovements = null;
let viewingAllWallets = false;

function toggleNewTransactionButton(show) {
    const newTxBtn = document.querySelector('#walletMovementsActions button[data-bs-target="#addTransactionModal"]');
    if (newTxBtn) newTxBtn.style.display = show ? '' : 'none';
}

function setDefaultDateRange() {
    const inputFrom = document.getElementById('filterDateFrom');
    const inputTo = document.getElementById('filterDateTo');

    const today = new Date();
    const dateToIso = today.toISOString().split('T')[0];
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30);
    const dateFromIso = pastDate.toISOString().split('T')[0];

    if (inputFrom) inputFrom.value = dateFromIso;
    if (inputTo) inputTo.value = dateToIso;
}

function openWalletMovementsPage(walletId) {

    const wallet = initial.userWallets.find(w => w.id == walletId);

    if (!wallet) return;

    viewingAllWallets = false;
    activeWalletForMovements = wallet;
    toggleNewTransactionButton(true);

    const titleEl = document.getElementById('pageWalletMovementsTitle');
    const subtitleEl = document.getElementById('pageWalletMovementsSubtitle');
    if (titleEl) titleEl.textContent = `${wallet.title}`;
    if (subtitleEl) subtitleEl.textContent = wallet.desc || 'Gestión y control de transacciones de la cartera.';

    setDefaultDateRange();

    renderWalletMovementsTable();
    initial.navigate('wallet-movements-view');
}

// Muestra el historial de movimientos de TODAS las carteras, sin filtrar por una en particular.
export function openAllWalletsMovementsPage() {
    viewingAllWallets = true;
    activeWalletForMovements = null;
    toggleNewTransactionButton(false);

    const titleEl = document.getElementById('pageWalletMovementsTitle');
    const subtitleEl = document.getElementById('pageWalletMovementsSubtitle');
    if (titleEl) titleEl.textContent = 'Todas las Carteras';
    if (subtitleEl) subtitleEl.textContent = 'Historial de movimientos de todas tus cuentas y carteras.';

    setDefaultDateRange();

    renderWalletMovementsTable();
    initial.navigate('wallet-movements-view');
}

// Reúne los movimientos de la cartera activa, o de todas si se está en modo "Todas las Carteras"
function getMovementsSource() {
    if (viewingAllWallets) {
        let all = [];
        initial.userWallets.forEach(w => {
            (w.movements || []).forEach(m => all.push({ ...m, __walletId: w.id, __walletTitle: w.title }));
        });
        return all;
    }
    return activeWalletForMovements ? (activeWalletForMovements.movements || []) : [];
}

// Ubica la cartera dueña de un movimiento por su id (necesario en modo "Todas las Carteras")
function findWalletForMovement(movId) {
    if (!viewingAllWallets) return activeWalletForMovements;
    return initial.userWallets.find(w => (w.movements || []).some(m => m.id == movId));
}

export function filterWalletMovements() {
    renderWalletMovementsTable();
}

export function printWalletMovements() {
    if (!viewingAllWallets && !activeWalletForMovements) return;
    window.print();
}

// Exportar a Excel
export function exportWalletMovementsExcel() {
    if (!viewingAllWallets && !activeWalletForMovements) return;

    const inputFrom = document.getElementById('filterDateFrom');
    const inputTo = document.getElementById('filterDateTo');
    const fromDateVal = inputFrom ? inputFrom.value : '';
    const toDateVal = inputTo ? inputTo.value : '';

    let movements = getMovementsSource();

    if (fromDateVal && toDateVal) {
        movements = movements.filter(m => {
            const mDateStr = m.date.split(' ')[0];
            return mDateStr >= fromDateVal && mDateStr <= toDateVal;
        });
    }

    if (movements.length === 0) {
        showAlertModal('Sin datos', 'No hay movimientos en el rango seleccionado para exportar.');
        return;
    }

    const dataToExport = movements.map(m => ({
        'Cartera': viewingAllWallets ? m.__walletTitle : activeWalletForMovements.title,
        'Tipo': m.type,
        'Categoría (Concepto)': m.category || 'General',
        'Monto': m.amount,
        'Fecha y Hora': m.date,
        'Descripción': m.desc || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    const safeTitle = viewingAllWallets ? 'Todas_las_Carteras' : activeWalletForMovements.title.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(workbook, `Movimientos_${safeTitle}.xlsx`);
}

export function renderWalletMovementsTable() {
    const tbody = document.getElementById('page-wallet-movements-table-body');
    const actionsDiv = document.getElementById('walletMovementsActions');
    const filtersDiv = document.getElementById('walletMovementsFilters');
    const tableContainer = document.getElementById('walletTableContainer');

    if (!tbody) return;
    if (!viewingAllWallets && !activeWalletForMovements) return;

    const hasAnyMovement = viewingAllWallets
        ? initial.userWallets.some(w => w.movements && w.movements.length > 0)
        : (activeWalletForMovements.movements && activeWalletForMovements.movements.length > 0);

    // Si no hay ningún movimiento registrado en el alcance actual (cartera o todas)
    if (!hasAnyMovement) {
        if(actionsDiv) { actionsDiv.classList.remove('d-flex'); actionsDiv.classList.add('d-none'); }
        if(filtersDiv) { filtersDiv.classList.remove('d-block'); filtersDiv.classList.add('d-none'); }
        if(tableContainer) tableContainer.classList.add('shadow-none', 'bg-transparent');

        const emptyActionBtn = viewingAllWallets ? '' : `
                    <button class="btn btn-primary px-4 py-2 shadow-sm" style="border-radius: 12px;" data-bs-toggle="modal" data-bs-target="#addTransactionModal">
                        <i class="fas fa-plus me-2"></i>Registrar mi primer ingreso
                    </button>`;

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 border-0">
                    <i class="fas fa-money-bill-wave fa-4x text-muted mb-3 opacity-25"></i>
                    <h5 class="fw-bold text-muted mb-2">Aún no hay movimientos</h5>
                    <p class="text-muted mb-4">${viewingAllWallets ? 'Ninguna de tus carteras tiene movimientos registrados todavía.' : 'Esta cartera está totalmente en blanco.<br>¡Anímate a realizar un ingreso y comienza a gestionar tu dinero!'}</p>
                    ${emptyActionBtn}
                </td>
            </tr>`;
        return;
    } else {
        // Restaurar estado normal
        if(actionsDiv) { actionsDiv.classList.remove('d-none'); actionsDiv.classList.add('d-flex'); }
        if(filtersDiv) { filtersDiv.classList.remove('d-none'); filtersDiv.classList.add('d-block'); }
        if(tableContainer) tableContainer.classList.remove('shadow-none', 'bg-transparent');
    }

    const inputFrom = document.getElementById('filterDateFrom');
    const inputTo = document.getElementById('filterDateTo');

    const fromDateVal = inputFrom ? inputFrom.value : '';
    const toDateVal = inputTo ? inputTo.value : '';

    let movements = getMovementsSource();

    if (fromDateVal && toDateVal) {
        movements = movements.filter(m => {
            const mDateStr = m.date.split(' ')[0];
            return mDateStr >= fromDateVal && mDateStr <= toDateVal;
        });
    } else if (fromDateVal) {
        movements = movements.filter(m => m.date.split(' ')[0] >= fromDateVal);
    } else if (toDateVal) {
        movements = movements.filter(m => m.date.split(' ')[0] <= toDateVal);
    }

    if (movements.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted border-0">No se encontraron movimientos con los filtros de fecha seleccionados.</td></tr>`;
        return;
    }

    if (viewingAllWallets) {
        movements = [...movements].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }

    let html = '';
    movements.forEach(mov => {
        const isIncome = mov.type === 'Ingreso';
        const typeIcon = isIncome 
            ? '<div class="rounded-circle bg-success bg-opacity-10 text-success p-2 d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i class="fas fa-arrow-down fs-6"></i></div>' 
            : '<div class="rounded-circle bg-danger bg-opacity-10 text-danger p-2 d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i class="fas fa-arrow-up fs-6"></i></div>';
        const amountColor = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';

        // LÓGICA ELEGANTE PARA LA CATEGORÍA:
        const catObj = initial.sysCategories.find(c => c.id == mov.category);
        const catIconClass = catObj ? catObj.iconId : 'fas fa-tag';
        const catDesc = catObj ? catObj.desc : 'General';

        const walletBadgeHtml = viewingAllWallets ? `<small class="text-muted d-block">${mov.__walletTitle}</small>` : '';

        const categoryHtml = `
            <div class="d-flex align-items-center gap-2">
                <div class="bg-secondary bg-opacity-10 rounded d-flex justify-content-center align-items-center text-secondary" style="width: 28px; height: 28px;">
                    <i class="${catIconClass}"></i>
                </div>
                <div><span>${catDesc}</span>${walletBadgeHtml}</div>
            </div>`;
        // <td class="py-3 fw-medium text-nowrap">${mov.category || 'General'}</td>
        const hasDesc = mov.desc && mov.desc.trim() !== '';
        const descIconHtml = hasDesc 
            ? `<button type="button" class="btn btn-sm btn-link text-info p-0 shadow-none" data-bs-toggle="tooltip" data-bs-placement="top" title="${mov.desc}"><i class="fas fa-info-circle fs-5"></i></button>`
            : `<span class="text-muted small">-</span>`;

        html += `
            <tr>
                <td class="py-3 text-nowrap">${typeIcon} <span class="ms-2 fw-medium">${mov.type}</span></td>
                
                <td class="py-3 fw-medium text-nowrap">${categoryHtml}</td>

                <td class="py-3 fw-bold ${amountColor} text-nowrap">${amountPrefix}$${mov.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-muted small text-nowrap">${mov.date}</td>
                <td class="py-3 text-center text-nowrap print-hide">${descIconHtml}</td>
                <td class="py-3 text-end text-nowrap print-hide">
                    <button class="btn btn-sm btn-outline-primary p-1 px-2 btnEditTransactionModal" data-id=${mov.id}><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger p-1 px-2 btnConfirmDeleteTransaction" data-id=${mov.id}><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;

    tbody.querySelectorAll('.btnEditTransactionModal').forEach(btnEditTransactionModal => {
        btnEditTransactionModal.addEventListener('click', () => {
            openEditTransactionModal(btnEditTransactionModal.getAttribute('data-id'));
        });
    });
    tbody.querySelectorAll('.btnConfirmDeleteTransaction').forEach(btnConfirmDeleteTransaction => {
        btnConfirmDeleteTransaction.addEventListener('click', () => {
            confirmDeleteTransaction(btnConfirmDeleteTransaction.getAttribute('data-id'));
        });
    });

    initial.reinitTooltips();
}

// Llena el selector de cartera del modal de Nueva Transacción y preselecciona la cartera correspondiente al contexto actual.
export function prepareAddTransactionModal() {
    const select = document.getElementById('txWallet');
    if (!select) return;

    if (initial.userWallets.length === 0) {
        select.innerHTML = `<option value="">No hay carteras registradas</option>`;
        return;
    }

    let html = '';
    initial.userWallets.forEach(w => {
        html += `<option value="${w.id}">${w.title}</option>`;
    });
    select.innerHTML = html;

    if (activeWalletForMovements) {
        select.value = activeWalletForMovements.id;
    } else {
        select.value = initial.userWallets[0].id;
    }
}

// Vincula la preparación automática del selector de cartera cada vez que se abre el modal de Nueva Transacción.
export function initTransactionModalEvents() {
    const modalEl = document.getElementById('addTransactionModal');
    if (!modalEl) return;
    modalEl.addEventListener('show.bs.modal', () => {
        prepareAddTransactionModal();
    });
}

export function saveNewTransaction() {
    const walletSelect = document.getElementById('txWallet');
    const walletId = walletSelect ? walletSelect.value : null;
    const targetWallet = walletId ? initial.userWallets.find(w => w.id == walletId) : activeWalletForMovements;

    if (!targetWallet) {
        showAlertModal('Cartera requerida', 'Por favor selecciona la cartera a la cual pertenece esta transacción.');
        return;
    }

    const type = document.getElementById('txType').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    const dateVal = document.getElementById('txDate').value;
    const timeVal = document.getElementById('txTime').value;
    const category = document.getElementById('txCategory').value.trim();
    const desc = document.getElementById('txDesc').value.trim();

    if (isNaN(amount) || amount <= 0) {
        showAlertModal('Monto inválido', 'Por favor ingresa un monto mayor a cero.');
        return;
    }

    if (!category) {
        showAlertModal('Categoría requerida', 'Por favor ingresa la categoría o concepto principal de la transacción.');
        return;
    }

    let formattedDate = '';
    const now = new Date();
    const curDate = dateVal || now.toISOString().split('T')[0];
    const curTime = timeVal || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    formattedDate = `${curDate} ${curTime}`;

    const newMov = {
        id: Date.now(),
        type,
        category,
        desc,
        date: formattedDate,
        amount
    };

    if (!targetWallet.movements) targetWallet.movements = [];
    targetWallet.movements.push(newMov);

    if (type === 'Ingreso') {
        targetWallet.balance += amount;
    } else {
        targetWallet.balance -= amount;
    }

    renderWallets();
    renderWalletMovementsTable();
    dashboard.renderDashboard();

    document.getElementById('txAmount').value = '';
    document.getElementById('txCategory').value = '';
    document.getElementById('txDesc').value = '';
    document.getElementById('txDate').value = '';
    document.getElementById('txTime').value = '';

    const modalEl = document.getElementById('addTransactionModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}


let currentEditingTransactionId = null;
let currentEditingTransactionWallet = null;

export function openEditTransactionModal(movId) {
    const wallet = findWalletForMovement(movId);
    if (!wallet) return;
    const mov = wallet.movements.find(m => m.id == movId);
    if (!mov) return;
    const catObj = initial.sysCategories.find(c => c.id == mov.category);

    currentEditingTransactionId = movId;
    currentEditingTransactionWallet = wallet;
    document.getElementById('editTxType').value = mov.type;
    document.getElementById('editTxAmount').value = mov.amount;
    document.getElementById('editTxCategory').value = mov.category || '';
    document.getElementById('editTxDesc').value = mov.desc || '';
    document.getElementById('btn-editTxCategory').innerHTML = `<span><i class="${catObj.iconId} me-2 text-primary"></i>${catObj.desc}</span> <i class="fas fa-chevron-down"></i>`;
    
    const parts = mov.date.split(' ');
    document.getElementById('editTxDate').value = parts[0] || '';
    document.getElementById('editTxTime').value = parts[1] || '';

    const modal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    modal.show();
}

export function saveEditedTransaction() {
    const wallet = currentEditingTransactionWallet;
    if (!wallet) return;
    const mov = wallet.movements.find(m => m.id == currentEditingTransactionId);
    if (!mov) return;

    const newType = document.getElementById('editTxType').value;
    const newAmount = parseFloat(document.getElementById('editTxAmount').value);
    const newCategory = document.getElementById('editTxCategory').value.trim();
    const newDesc = document.getElementById('editTxDesc').value.trim();
    const newDate = document.getElementById('editTxDate').value;
    const newTime = document.getElementById('editTxTime').value;

    if (isNaN(newAmount) || newAmount <= 0) {
        showAlertModal('Monto inválido', 'Ingrese un monto válido.');
        return;
    }

    if (mov.type === 'Ingreso') {
        wallet.balance -= mov.amount;
    } else {
        wallet.balance += mov.amount;
    }

    if (newType === 'Ingreso') {
        wallet.balance += newAmount;
    } else {
        wallet.balance -= newAmount;
    }

    mov.type = newType;
    mov.amount = newAmount;
    mov.category = newCategory;
    mov.desc = newDesc;
    if (newDate && newTime) {
        mov.date = `${newDate} ${newTime}`;
    }

    renderWallets();
    renderWalletMovementsTable();
    dashboard.renderDashboard();

    const modalEl = document.getElementById('editTransactionModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

export function confirmDeleteTransaction(movId) {
    initial.showConfirmModal('¿Eliminar Movimiento?', 'Esta acción eliminará el movimiento y ajustará el balance de la cartera.', () => {
        const wallet = findWalletForMovement(movId);
        if (!wallet) return;
        const index = wallet.movements.findIndex(m => m.id == movId);
        if (index !== -1) {
            const mov = wallet.movements[index];
            if (mov.type === 'Ingreso') {
                wallet.balance -= mov.amount;
            } else {
                wallet.balance += mov.amount;
            }
            wallet.movements.splice(index, 1);
            renderWallets();
            renderWalletMovementsTable();
            dashboard.renderDashboard();
        }
    });
}

export function saveNewWallet() {
    const title = document.getElementById('walletTitle').value.trim();
    const balance = parseFloat(document.getElementById('walletBalance').value) || 0;
    const icon = document.getElementById('walletIcon').value;
    const affectsBalance = document.getElementById('walletAffectsBalance').checked;
    const desc = document.getElementById('walletDesc').value.trim();

    if (!title) {
        initial.showAlertModal('Datos incompletos', 'Por favor ingresa un título para la cartera.');
        return;
    }

    const newWallet = {
        id: Date.now(),
        title,
        balance,
        icon,
        affectsBalance,
        desc,
        movements: balance > 0 ? [{ id: Date.now(), type: 'Ingreso', desc: 'Balance inicial', date: '2026-09-12 12:23', amount: balance, category: 'Balance Inicial' }] : []
    };

    initial.userWallets.push(newWallet);
    renderWallets();
    dashboard.renderDashboard();

    document.getElementById('walletTitle').value = '';
    document.getElementById('walletBalance').value = '0';
    document.getElementById('walletDesc').value = '';
    document.getElementById('walletAffectsBalance').checked = true;

    const modalEl = document.getElementById('addWalletModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingWalletId = null;

export function openEditWalletModal(id) {

    const wallet = initial.userWallets.find(w => w.id == id);
    if (!wallet) return;

    currentEditingWalletId = id;
    document.getElementById('editWalletTitle').value = wallet.title;
    document.getElementById('editWalletIcon').value = wallet.icon;
    document.getElementById('btn-editWalletIcon').innerHTML = `<span><i class="${wallet.icon} me-2 text-primary"></i></span> <i class="fas fa-chevron-down"></i>`;
    document.getElementById('editWalletAffectsBalance').checked = wallet.affectsBalance;
    document.getElementById('editWalletDesc').value = wallet.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editWalletModal'));
    modal.show();
}

export function saveEditedWallet() {
    const wallet = initial.userWallets.find(w => w.id == currentEditingWalletId);
    if (!wallet) return;

    wallet.title = document.getElementById('editWalletTitle').value.trim();
    wallet.icon = document.getElementById('editWalletIcon').value;
    wallet.affectsBalance = document.getElementById('editWalletAffectsBalance').checked;
    wallet.desc = document.getElementById('editWalletDesc').value.trim();

    renderWallets();
    dashboard.renderDashboard();

    const modalEl = document.getElementById('editWalletModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

export function confirmDeleteWallet(id) {
    initial.showConfirmModal('¿Eliminar Cartera?', 'Esta acción eliminará la cartera permanentemente.', () => {

        initial.setUserWallets(initial.userWallets.filter(w => w.id != id));
        renderWallets();
        dashboard.renderDashboard();
    });
}