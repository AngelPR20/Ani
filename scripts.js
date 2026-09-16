// ==========================================
// 1. NAVEGACIÓN Y CONFIGURACIÓN DE INTERFAZ
// ==========================================

function navigate(viewId, element) {
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }

    if (element) {
        document.querySelectorAll('.sidebar-content .nav-item-custom, .others-sidebar-content .nav-item-custom').forEach(nav => {
            nav.classList.remove('active-link');
        });
        element.classList.add('active-link');
    }
}

function toggleTheme() {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('finanzaspro_theme', newTheme);
}

function toggleDesktopSidebar() {
    const body = document.body;
    body.classList.toggle('sidebar-collapsed');
    const isCollapsed = body.classList.contains('sidebar-collapsed');
    localStorage.setItem('finanzaspro_sidebar_collapsed', isCollapsed);
}

function logout() {
    localStorage.removeItem('finanzaspro_theme');
    localStorage.removeItem('finanzaspro_sidebar_collapsed');
    window.location.reload();
}

// Función auxiliar para reiniciar Tooltips en elementos inyectados por JS
function reinitTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}


// ==========================================
// 2. INICIALIZACIÓN DE GRÁFICOS Y TOOLTIPS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar switch de tema oscuro según estado actual
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) {
        darkModeSwitch.checked = (localStorage.getItem('finanzaspro_theme') === 'dark');
    }

    reinitTooltips();

    // Inicializar datos de módulos al cargar
    initMasterBudget();
    renderGoals();
    renderWallets();
    initMaintenances();

    // Gráfico de Barras (Ingresos vs Gastos Anuales)
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [
                    {
                        label: 'Ingresos',
                        data: [1200, 1900, 1500, 2200, 1800, 2500, 2300, 3000, 2800, 3200, 3100, 3500],
                        backgroundColor: 'rgba(13, 110, 253, 0.7)',
                        borderRadius: 6
                    },
                    {
                        label: 'Gastos',
                        data: [800, 1200, 950, 1400, 1100, 1600, 1500, 1900, 1700, 2100, 2000, 2300],
                        backgroundColor: 'rgba(220, 53, 69, 0.7)',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(200, 200, 200, 0.1)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Gráfico de Dona (Distribución Actual)
    const doughnutCtx = document.getElementById('doughnutChart');
    if (doughnutCtx) {
        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Alimentación', 'Servicios', 'Entretenimiento', 'Ahorros'],
                datasets: [{
                    data: [450, 300, 150, 600],
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.8)',
                        'rgba(25, 135, 84, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(13, 202, 240, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
});


// ==========================================
// 3. MÓDULO DE CARTERAS (WALLETS)
// ==========================================

let userWallets = [
    { 
        id: 1, 
        title: 'Banco Popular', 
        balance: 1500.00, 
        icon: 'fas fa-university', 
        affectsBalance: true, 
        desc: 'Cuenta de ahorros principal',
        movements: [
            { id: 1001, type: 'Ingreso', category: 'Nómina', desc: 'Depósito de nómina mensual', date: '2026-09-01 10:30', amount: 1500.00 }
        ]
    },
    { 
        id: 2, 
        title: 'Fondo de Inversión', 
        balance: 3200.00, 
        icon: 'fas fa-piggy-bank', 
        affectsBalance: false, 
        desc: 'Ahorro a largo plazo',
        movements: [
            { id: 1002, type: 'Ingreso', category: 'Inversión', desc: 'Rendimiento mensual de acciones', date: '2026-09-05 14:00', amount: 200.00 }
        ]
    },
    { 
        id: 3, 
        title: 'Efectivo', 
        balance: 0.00, 
        icon: 'fas fa-wallet', 
        affectsBalance: true, 
        desc: 'Dinero en billetera',
        movements: [] // Ejemplo de cartera sin movimientos para estado vacío
    }
];

function renderWallets() {
    const container = document.getElementById('wallets-container');
    const headerNewWalletBtn = document.getElementById('headerNewWalletBtn');
    
    if (!container) return;

    if (userWallets.length === 0) {
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

    userWallets.forEach(wallet => {
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
                                        <li><button class="dropdown-item py-2" onclick="openEditWalletModal(${wallet.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                        <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeleteWallet(${wallet.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
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
                        <button class="btn btn-sm btn-outline-secondary px-2 py-1 mt-1" style="border-radius: 8px;" onclick="openWalletMovementsPage(${wallet.id})">
                            <i class="fas fa-list-alt me-1"></i> Ver Movimientos
                        </button>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    reinitTooltips();
}

let activeWalletForMovements = null;

function openWalletMovementsPage(walletId) {
    const wallet = userWallets.find(w => w.id === walletId);
    if (!wallet) return;

    activeWalletForMovements = wallet;

    const titleEl = document.getElementById('pageWalletMovementsTitle');
    const subtitleEl = document.getElementById('pageWalletMovementsSubtitle');
    if (titleEl) titleEl.textContent = `${wallet.title}`;
    if (subtitleEl) subtitleEl.textContent = wallet.desc || 'Gestión y control de transacciones de la cartera.';

    // Asignar por defecto los últimos 30 días
    const inputFrom = document.getElementById('filterDateFrom');
    const inputTo = document.getElementById('filterDateTo');

    const today = new Date();
    const dateToIso = today.toISOString().split('T')[0];
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 30);
    const dateFromIso = pastDate.toISOString().split('T')[0];

    if (inputFrom) inputFrom.value = dateFromIso;
    if (inputTo) inputTo.value = dateToIso;

    renderWalletMovementsTable();
    navigate('wallet-movements-view');
}

function filterWalletMovements() {
    renderWalletMovementsTable();
}

function printWalletMovements() {
    if (!activeWalletForMovements) return;
    window.print();
}

// Exportar a Excel
function exportWalletMovementsExcel() {
    if (!activeWalletForMovements) return;

    const inputFrom = document.getElementById('filterDateFrom');
    const inputTo = document.getElementById('filterDateTo');
    const fromDateVal = inputFrom ? inputFrom.value : '';
    const toDateVal = inputTo ? inputTo.value : '';

    let movements = activeWalletForMovements.movements || [];

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
        'Tipo': m.type,
        'Categoría (Concepto)': m.category || 'General',
        'Monto': m.amount,
        'Fecha y Hora': m.date,
        'Descripción': m.desc || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    const safeTitle = activeWalletForMovements.title.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(workbook, `Movimientos_${safeTitle}.xlsx`);
}

function renderWalletMovementsTable() {
    const tbody = document.getElementById('page-wallet-movements-table-body');
    const actionsDiv = document.getElementById('walletMovementsActions');
    const filtersDiv = document.getElementById('walletMovementsFilters');
    const tableContainer = document.getElementById('walletTableContainer');

    if (!tbody || !activeWalletForMovements) return;

    const hasAnyMovement = activeWalletForMovements.movements && activeWalletForMovements.movements.length > 0;

    // Si la cartera nunca ha tenido movimientos en su historia
    if (!hasAnyMovement) {
        if(actionsDiv) { actionsDiv.classList.remove('d-flex'); actionsDiv.classList.add('d-none'); }
        if(filtersDiv) { filtersDiv.classList.remove('d-block'); filtersDiv.classList.add('d-none'); }
        if(tableContainer) tableContainer.classList.add('shadow-none', 'bg-transparent');
        
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 border-0">
                    <i class="fas fa-money-bill-wave fa-4x text-muted mb-3 opacity-25"></i>
                    <h5 class="fw-bold text-muted mb-2">Aún no hay movimientos</h5>
                    <p class="text-muted mb-4">Esta cartera está totalmente en blanco.<br>¡Anímate a realizar un ingreso y comienza a gestionar tu dinero!</p>
                    <button class="btn btn-primary px-4 py-2 shadow-sm" style="border-radius: 12px;" data-bs-toggle="modal" data-bs-target="#addTransactionModal">
                        <i class="fas fa-plus me-2"></i>Registrar mi primer ingreso
                    </button>
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

    let movements = activeWalletForMovements.movements || [];

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

    let html = '';
    movements.forEach(mov => {
        const isIncome = mov.type === 'Ingreso';
        const typeIcon = isIncome 
            ? '<div class="rounded-circle bg-success bg-opacity-10 text-success p-2 d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i class="fas fa-arrow-down fs-6"></i></div>' 
            : '<div class="rounded-circle bg-danger bg-opacity-10 text-danger p-2 d-inline-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i class="fas fa-arrow-up fs-6"></i></div>';
        const amountColor = isIncome ? 'text-success' : 'text-danger';
        const amountPrefix = isIncome ? '+' : '-';
        
        const hasDesc = mov.desc && mov.desc.trim() !== '';
        const descIconHtml = hasDesc 
            ? `<button type="button" class="btn btn-sm btn-link text-info p-0 shadow-none" data-bs-toggle="tooltip" data-bs-placement="top" title="${mov.desc}"><i class="fas fa-info-circle fs-5"></i></button>`
            : `<span class="text-muted small">-</span>`;

        html += `
            <tr>
                <td class="py-3 text-nowrap">${typeIcon} <span class="ms-2 fw-medium">${mov.type}</span></td>
                <td class="py-3 fw-medium text-nowrap">${mov.category || 'General'}</td>
                <td class="py-3 fw-bold ${amountColor} text-nowrap">${amountPrefix}$${mov.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-muted small text-nowrap">${mov.date}</td>
                <td class="py-3 text-center text-nowrap print-hide">${descIconHtml}</td>
                <td class="py-3 text-end text-nowrap print-hide">
                    <button class="btn btn-sm btn-outline-primary p-1 px-2" onclick="openEditTransactionModal(${mov.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger p-1 px-2" onclick="confirmDeleteTransaction(${mov.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;

    reinitTooltips();
}

function saveNewTransaction() {
    if (!activeWalletForMovements) {
        showAlertModal('Error', 'No hay ninguna cartera activa seleccionada.');
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

    if (!activeWalletForMovements.movements) activeWalletForMovements.movements = [];
    activeWalletForMovements.movements.push(newMov);

    if (type === 'Ingreso') {
        activeWalletForMovements.balance += amount;
    } else {
        activeWalletForMovements.balance -= amount;
    }

    renderWallets();
    renderWalletMovementsTable();

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

function openEditTransactionModal(movId) {
    if (!activeWalletForMovements) return;
    const mov = activeWalletForMovements.movements.find(m => m.id === movId);
    if (!mov) return;

    currentEditingTransactionId = movId;
    document.getElementById('editTxType').value = mov.type;
    document.getElementById('editTxAmount').value = mov.amount;
    document.getElementById('editTxCategory').value = mov.category || '';
    document.getElementById('editTxDesc').value = mov.desc || '';
    
    const parts = mov.date.split(' ');
    document.getElementById('editTxDate').value = parts[0] || '';
    document.getElementById('editTxTime').value = parts[1] || '';

    const modal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    modal.show();
}

function saveEditedTransaction() {
    if (!activeWalletForMovements) return;
    const mov = activeWalletForMovements.movements.find(m => m.id === currentEditingTransactionId);
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
        activeWalletForMovements.balance -= mov.amount;
    } else {
        activeWalletForMovements.balance += mov.amount;
    }

    if (newType === 'Ingreso') {
        activeWalletForMovements.balance += newAmount;
    } else {
        activeWalletForMovements.balance -= newAmount;
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

    const modalEl = document.getElementById('editTransactionModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeleteTransaction(movId) {
    showConfirmModal('¿Eliminar Movimiento?', 'Esta acción eliminará el movimiento y ajustará el balance de la cartera.', () => {
        if (!activeWalletForMovements) return;
        const index = activeWalletForMovements.movements.findIndex(m => m.id === movId);
        if (index !== -1) {
            const mov = activeWalletForMovements.movements[index];
            if (mov.type === 'Ingreso') {
                activeWalletForMovements.balance -= mov.amount;
            } else {
                activeWalletForMovements.balance += mov.amount;
            }
            activeWalletForMovements.movements.splice(index, 1);
            renderWallets();
            renderWalletMovementsTable();
        }
    });
}

// Funciones auxiliares para modales
function showAlertModal(title, text) {
    const titleEl = document.getElementById('alertModalTitle');
    const textEl = document.getElementById('alertModalText');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    const modal = new bootstrap.Modal(document.getElementById('actionAlertModal'));
    modal.show();
}

function showConfirmModal(title, text, callback) {
    const titleEl = document.getElementById('confirmModalTitle');
    const textEl = document.getElementById('confirmModalText');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    
    const confirmBtn = document.getElementById('confirmModalBtn');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('actionConfirmModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        callback();
    });

    const modal = new bootstrap.Modal(document.getElementById('actionConfirmModal'));
    modal.show();
}

function saveNewWallet() {
    const title = document.getElementById('walletTitle').value.trim();
    const balance = parseFloat(document.getElementById('walletBalance').value) || 0;
    const icon = document.getElementById('walletIcon').value;
    const affectsBalance = document.getElementById('walletAffectsBalance').checked;
    const desc = document.getElementById('walletDesc').value.trim();

    if (!title) {
        showAlertModal('Datos incompletos', 'Por favor ingresa un título para la cartera.');
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

    userWallets.push(newWallet);
    renderWallets();

    document.getElementById('walletTitle').value = '';
    document.getElementById('walletBalance').value = '0';
    document.getElementById('walletDesc').value = '';
    document.getElementById('walletAffectsBalance').checked = true;

    const modalEl = document.getElementById('addWalletModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingWalletId = null;

function openEditWalletModal(id) {
    const wallet = userWallets.find(w => w.id === id);
    if (!wallet) return;

    currentEditingWalletId = id;
    document.getElementById('editWalletTitle').value = wallet.title;
    document.getElementById('editWalletIcon').value = wallet.icon;
    document.getElementById('editWalletAffectsBalance').checked = wallet.affectsBalance;
    document.getElementById('editWalletDesc').value = wallet.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editWalletModal'));
    modal.show();
}

function saveEditedWallet() {
    const wallet = userWallets.find(w => w.id === currentEditingWalletId);
    if (!wallet) return;

    wallet.title = document.getElementById('editWalletTitle').value.trim();
    wallet.icon = document.getElementById('editWalletIcon').value;
    wallet.affectsBalance = document.getElementById('editWalletAffectsBalance').checked;
    wallet.desc = document.getElementById('editWalletDesc').value.trim();

    renderWallets();

    const modalEl = document.getElementById('editWalletModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeleteWallet(id) {
    showConfirmModal('¿Eliminar Cartera?', 'Esta acción eliminará la cartera permanentemente.', () => {
        userWallets = userWallets.filter(w => w.id !== id);
        renderWallets();
    });
}

// ==========================================
// 4. MÓDULO DE METAS (GOALS)
// ==========================================

let userGoals = [
    { id: 1, title: 'Auto Nuevo', target: 10000, current: 6500, icon: 'fas fa-car', desc: 'Ahorro para vehículo del año' },
    { id: 2, title: 'Vacaciones', target: 3000, current: 900, icon: 'fas fa-globe-americas', desc: 'Viaje familiar veraniego' }
];

function renderGoals() {
    const container = document.getElementById('goals-container');
    const overallBadge = document.getElementById('overallAverageBadge');
    const headerNewGoalBtn = document.getElementById('headerNewGoalBtn');
    const overallAverageBadge = document.getElementById('overallAverageBadge');
    
    if (!container) return;

    if (userGoals.length === 0) {
        if (headerNewGoalBtn) headerNewGoalBtn.style.display = 'none';
        if (headerNewGoalBtn) overallAverageBadge.style.display = 'none';
        container.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-rocket fa-4x text-muted mb-3 opacity-25"></i>
            <h5 class="fw-bold text-muted mb-2">Aún no hay metas registradas</h5>
            <p class="text-muted">Trazar objetivos es el primer paso para lograrlos.<br>¡Crea tu primera meta financiera hoy y dale rumbo a tus ahorros!</p>
            <button class="btn btn-sm btn-primary px-3 py-2 mt-2" data-bs-toggle="modal" data-bs-target="#addGoalModal" style="border-radius: 10px;">
                <i class="fas fa-plus me-2"></i>Crear Meta
            </button>
        </div>`;
        if (overallBadge) overallBadge.textContent = 'Promedio General: 0.00%';
        return;
    } else {
        if (headerNewGoalBtn) headerNewGoalBtn.style.display = '';
        if (headerNewGoalBtn) overallAverageBadge.style.display = '';
    }

    let html = '';
    let totalPercent = 0;

    userGoals.forEach(goal => {
        let percent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        if (percent > 100) percent = 100;
        totalPercent += percent;

        let colorClass = '';
        let gradientClass = '';

        if (percent <= 25) {
            colorClass = 'text-danger';
            gradientClass = 'bg-gradient-danger';
        } else if (percent <= 50) {
            colorClass = 'text-warning';
            gradientClass = 'bg-gradient-warning';
        } else if (percent <= 75) {
            colorClass = 'text-success-light';
            gradientClass = 'bg-gradient-success-light';
        } else {
            colorClass = 'text-success-dark';
            gradientClass = 'bg-gradient-success-dark';
        }

        const formattedCurrent = goal.current.toLocaleString('en-US', {minimumFractionDigits: 2});
        const formattedTarget = goal.target.toLocaleString('en-US', {minimumFractionDigits: 2});

        html += `
            <div class="col-md-6 col-xl-4">
                <div class="glass p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 text-primary rounded p-3 me-3 fs-4">
                                    <i class="${goal.icon}"></i>
                                </div>
                                <h5 class="fw-bold mb-0 me-2">${goal.title}</h5>
                            </div>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-exclamation-circle text-muted me-2" style="cursor:help;" data-bs-toggle="tooltip" data-bs-placement="top" title="${goal.desc || 'Sin descripción provista'}"></i>
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                        <li><button class="dropdown-item py-2" onclick="openEditGoalModal(${goal.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                        <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeleteGoal(${goal.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h4 class="fw-bold mb-0 ${colorClass}">${percent.toFixed(1)}%</h4>
                        </div>
                        <div class="progress mb-2" style="height: 8px; border-radius: 10px; background: var(--input-bg);">
                            <div class="progress-bar ${gradientClass}" style="width: ${percent}%; border-radius: 10px;"></div>
                        </div>
                        <small class="text-muted d-block">$${formattedCurrent} / $${formattedTarget}</small>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    if (overallBadge) {
        const avg = totalPercent / userGoals.length;
        overallBadge.textContent = `Promedio General: ${avg.toFixed(2)}%`;
    }
    
    reinitTooltips();
}

function saveNewGoal() {
    const title = document.getElementById('goalTitle').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    const icon = document.getElementById('goalIcon').value;
    const desc = document.getElementById('goalDesc').value.trim();

    if (!title || isNaN(target) || target <= 0) {
        showAlertModal('Datos incompletos', 'Por favor ingresa un título y un monto objetivo válido.');
        return;
    }

    userGoals.push({
        id: Date.now(),
        title,
        target,
        current,
        icon,
        desc
    });

    renderGoals();

    document.getElementById('goalTitle').value = '';
    document.getElementById('goalTarget').value = '';
    document.getElementById('goalCurrent').value = '0';
    document.getElementById('goalDesc').value = '';

    const modalEl = document.getElementById('addGoalModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingGoalId = null;

function openEditGoalModal(goalId) {
    const goal = userGoals.find(g => g.id === goalId);
    if (!goal) return;

    currentEditingGoalId = goalId;
    document.getElementById('editGoalTitle').value = goal.title;
    document.getElementById('editGoalTarget').value = goal.target;
    document.getElementById('editGoalCurrent').value = goal.current;
    document.getElementById('editGoalIcon').value = goal.icon;
    document.getElementById('editGoalDesc').value = goal.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editGoalModal'));
    modal.show();
}

function saveEditedGoal() {
    const goal = userGoals.find(g => g.id === currentEditingGoalId);
    if (!goal) return;

    goal.title = document.getElementById('editGoalTitle').value.trim();
    goal.target = parseFloat(document.getElementById('editGoalTarget').value);
    goal.current = parseFloat(document.getElementById('editGoalCurrent').value) || 0;
    goal.icon = document.getElementById('editGoalIcon').value;
    goal.desc = document.getElementById('editGoalDesc').value.trim();

    renderGoals();

    const modalEl = document.getElementById('editGoalModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeleteGoal(goalId) {
    showConfirmModal('¿Eliminar Meta?', '¿Estás seguro de eliminar esta meta financiera?', () => {
        userGoals = userGoals.filter(g => g.id !== goalId);
        renderGoals();
    });
}


// ==========================================
// 5. MÓDULO DE PRESUPUESTO (BUDGETS)
// ==========================================

let masterBudgets = [
    {
        id: 1,
        periodName: 'Septiembre 2026',
        items: [
            { id: 201, type: 'Gasto Fijo', title: 'Luz Eléctrica', amount: 85.50, affectsBalance: true, icon: 'fas fa-bolt', desc: 'Servicio eléctrico mensual' },
            { id: 202, type: 'Reserva', title: 'Fondo de Emergencia', amount: 300.00, affectsBalance: false, icon: 'fas fa-shield-alt', desc: 'Ahorro preventivo' }
        ]
    },
    {
        id: 2,
        periodName: 'Agosto 2026',
        items: [
            { id: 203, type: 'Gasto Fijo', title: 'Alquiler', amount: 500.00, affectsBalance: true, icon: 'fas fa-home', desc: 'Pago de apartamento' }
        ]
    }
];

let activeBudgetPeriodId = null;

function initMasterBudget() {
    if (masterBudgets.length > 0 && !activeBudgetPeriodId) {
        activeBudgetPeriodId = masterBudgets[0].id;
    }
    renderMasterBudgetList();
    renderBudgetDetails();
}

function renderMasterBudgetList() {
    const container = document.getElementById('master-month-list');
    if (!container) return;

    if (masterBudgets.length === 0) {
        container.innerHTML = `<p class="text-muted small text-center py-3">No hay períodos creados.</p>`;
        return;
    }

    let html = '';
    masterBudgets.forEach(period => {
        const isActive = period.id === activeBudgetPeriodId;
        const activeClass = isActive ? 'btn-primary shadow-sm' : 'btn-outline-secondary';

        html += `
            <div class="d-flex align-items-center gap-1">
                <button class="btn ${activeClass} w-100 text-start py-2 px-3" style="border-radius: 10px;" onclick="selectBudgetPeriod(${period.id})">
                    <i class="fas fa-calendar-alt me-2"></i>${period.periodName}
                </button>
                <div class="dropdown">
                    <button class="btn btn-sm btn-link text-muted px-2" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                        <li><button class="dropdown-item py-2" onclick="openEditBudgetPeriodModal(${period.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                        <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeleteBudgetPeriod(${period.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                    </ul>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

function selectBudgetPeriod(periodId) {
    activeBudgetPeriodId = periodId;
    renderMasterBudgetList();
    renderBudgetDetails();
}

function renderBudgetDetails() {
    const titleEl = document.getElementById('detail-month-title');
    const tableBody = document.getElementById('budget-table-body');
    const cardsContainer = document.getElementById('budget-cards-container');
    const totalFixedEl = document.getElementById('totalFixedExpenses');
    const totalReservesEl = document.getElementById('totalReserves');
    const totalAffectingEl = document.getElementById('totalAffectingBalance');
    const addNewItemBtn = document.getElementById('addNewItemBtn');
    if (addNewItemBtn) addNewItemBtn.style.display = '';


    const period = masterBudgets.find(p => p.id === activeBudgetPeriodId);

    if (!period) {
        if (titleEl) titleEl.textContent = '';
        if (addNewItemBtn) addNewItemBtn.style.display = 'none';
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Ningún período seleccionado.</td></tr>`;
        if (cardsContainer) cardsContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted">Ningún período seleccionado.</div>`;
        if (totalFixedEl) totalFixedEl.textContent = '$0.00';
        if (totalReservesEl) totalReservesEl.textContent = '$0.00';
        if (totalAffectingEl) totalAffectingEl.textContent = '$0.00';
        return;
    }

    if (titleEl) titleEl.textContent = `${period.periodName}`;

    let totalFixed = 0;
    let totalReserves = 0;
    let totalAffecting = 0;

    period.items.forEach(item => {
        if (item.type === 'Gasto Fijo') {
            totalFixed += item.amount;
        } else if (item.type === 'Reserva') {
            totalReserves += item.amount;
        }
        if (item.affectsBalance) {
            totalAffecting += item.amount;
        }
    });

    if (totalFixedEl) totalFixedEl.textContent = `$${totalFixed.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (totalReservesEl) totalReservesEl.textContent = `$${totalReserves.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (totalAffectingEl) totalAffectingEl.textContent = `$${totalAffecting.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    if (period.items.length === 0) {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay registros en este período.</td></tr>`;
        if (cardsContainer) cardsContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted">No hay registros en este período.</div>`;
        return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    period.items.forEach(item => {
        const isFixed = item.type === 'Gasto Fijo';
        const typeBadge = isFixed 
            ? '<span class="badge bg-danger bg-opacity-10 text-danger px-2 py-1">Gasto Fijo</span>' 
            : '<span class="badge bg-info bg-opacity-10 text-info px-2 py-1">Reserva</span>';
        
        const hasDesc = item.desc && item.desc.trim() !== '';
        const descIconHtml = hasDesc 
            ? `<button type="button" class="btn btn-sm btn-link text-info p-0 shadow-none" data-bs-toggle="tooltip" data-bs-placement="top" title="${item.desc}"><i class="fas fa-info-circle fs-5"></i></button>`
            : `<span class="text-muted small mt-1">-</span>`;

        const affectsBadge = item.affectsBalance 
            ? '<span class="text-success small fw-medium"><i class="fas fa-check-circle me-1"></i>Sí</span>' 
            : '<span class="text-muted small fw-medium"><i class="fas fa-times-circle me-1"></i>No</span>';

        tableHtml += `
            <tr>
                <td class="py-3 text-nowrap">${typeBadge}</td>
                <td class="py-3 fw-medium text-nowrap"><i class="${item.icon} me-2 text-primary"></i>${item.title}</td>
                <td class="py-3 text-center text-nowrap print-hide">${descIconHtml}</td>
                <td class="py-3 text-nowrap text-center">${affectsBadge}</td>
                <td class="py-3 fw-bold text-nowrap">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-primary p-1 px-2" onclick="openEditBudgetItemModal(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger p-1 px-2" onclick="confirmDeleteBudgetItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;

        cardsHtml += `
            <div class="col-12">
                <div class="glass p-3 d-flex justify-content-between align-items-center shadow-none border-0 border-top border-bottom rounded-0">
                    
                
                    <div>
                        <div class="d-flex gap-3">
                            <div class="mb-2">${typeBadge}</div>
                            ${descIconHtml}
                        </div>
                        <h6 class="fw-bold my-2"><i class="${item.icon} me-2 text-primary"></i>${item.title}</h6>
                        <small class="text-muted d-block">Afecta Balance: ${item.affectsBalance ? 'Sí' : 'No'}</small>
                    </div>
                    

                    <div class="text-end">
                        <h5 class="fw-bold mb-2">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</h5>
                        <div>
                            <button class="btn btn-sm btn-outline-primary p-1 px-2" onclick="openEditBudgetItemModal(${item.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger p-1 px-2" onclick="confirmDeleteBudgetItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    if (tableBody) tableBody.innerHTML = tableHtml;
    if (cardsContainer) cardsContainer.innerHTML = cardsHtml;
}

function saveBudgetItem() {
    const period = masterBudgets.find(p => p.id === activeBudgetPeriodId);
    if (!period) {
        showAlertModal('Error', 'Selecciona un período de presupuesto válido.');
        return;
    }

    const type = document.getElementById('budgetType').value;
    const title = document.getElementById('budgetTitle').value.trim();
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const icon = document.getElementById('budgetIcon').value;
    const affectsBalance = document.getElementById('budgetAffectsBalance').checked;
    const desc = document.getElementById('budgetDesc').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
        showAlertModal('Datos incompletos', 'Por favor ingresa un título y un monto válido.');
        return;
    }

    const newItem = {
        id: Date.now(),
        type,
        title,
        amount,
        affectsBalance,
        icon,
        desc
    };

    period.items.push(newItem);
    renderBudgetDetails();

    document.getElementById('budgetTitle').value = '';
    document.getElementById('budgetAmount').value = '';
    document.getElementById('budgetDesc').value = '';

    const modalEl = document.getElementById('addBudgetItemModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingBudgetItemId = null;

function openEditBudgetItemModal(itemId) {
    let targetItem = null;
    let targetPeriod = null;

    masterBudgets.forEach(p => {
        const found = p.items.find(i => i.id === itemId);
        if (found) {
            targetItem = found;
            targetPeriod = p;
        }
    });

    if (!targetItem || !targetPeriod) return;

    currentEditingBudgetItemId = itemId;

    document.getElementById('editBudgetType').value = targetItem.type;
    document.getElementById('editBudgetTitle').value = targetItem.title;
    document.getElementById('editBudgetAmount').value = targetItem.amount;
    document.getElementById('editBudgetIcon').value = targetItem.icon;
    document.getElementById('editBudgetAffectsBalance').checked = targetItem.affectsBalance;
    document.getElementById('editBudgetDesc').value = targetItem.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editBudgetItemModal'));
    modal.show();
}

function saveEditedBudgetItem() {
    let targetItem = null;
    let oldPeriod = null;

    masterBudgets.forEach(p => {
        const found = p.items.find(i => i.id === currentEditingBudgetItemId);
        if (found) {
            targetItem = found;
            oldPeriod = p;
        }
    });

    if (!targetItem || !oldPeriod) return;

    targetItem.type = document.getElementById('editBudgetType').value;
    targetItem.title = document.getElementById('editBudgetTitle').value.trim();
    targetItem.amount = parseFloat(document.getElementById('editBudgetAmount').value);
    targetItem.icon = document.getElementById('editBudgetIcon').value;
    targetItem.affectsBalance = document.getElementById('editBudgetAffectsBalance').checked;
    targetItem.desc = document.getElementById('editBudgetDesc').value.trim();

    // El registro mantiene su mes original como se solicitó.
    
    renderBudgetDetails();

    const modalEl = document.getElementById('editBudgetItemModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeleteBudgetItem(itemId) {
    showConfirmModal('¿Eliminar Gasto/Reserva?', 'Esta acción eliminará el registro de este presupuesto.', () => {
        masterBudgets.forEach(p => {
            p.items = p.items.filter(i => i.id !== itemId);
        });
        renderBudgetDetails();
    });
}

function addNewBudgetPeriodModal() {
    const input = document.getElementById('newPeriodNameInput');
    if (input) input.value = '';
    const modal = new bootstrap.Modal(document.getElementById('addBudgetPeriodModal'));
    modal.show();
}

function saveNewBudgetPeriod() {
    const input = document.getElementById('newPeriodNameInput');
    const name = input ? input.value.trim() : '';

    if (!name) {
        showAlertModal('Nombre requerido', 'Por favor ingresa un nombre para el período.');
        return;
    }

    const newPeriod = {
        id: Date.now(),
        periodName: name,
        items: []
    };

    masterBudgets.push(newPeriod);
    activeBudgetPeriodId = newPeriod.id;
    renderMasterBudgetList();
    renderBudgetDetails();

    const modalEl = document.getElementById('addBudgetPeriodModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingPeriodId = null;

function openEditBudgetPeriodModal(periodId) {
    const period = masterBudgets.find(p => p.id === periodId);
    if (!period) return;

    currentEditingPeriodId = periodId;
    const input = document.getElementById('editPeriodNameInput');
    if (input) input.value = period.periodName;

    const modal = new bootstrap.Modal(document.getElementById('editBudgetPeriodModal'));
    modal.show();
}

function saveEditedBudgetPeriod() {
    const period = masterBudgets.find(p => p.id === currentEditingPeriodId);
    if (!period) return;

    const input = document.getElementById('editPeriodNameInput');
    const name = input ? input.value.trim() : '';
    if (!name) {
        showAlertModal('Nombre requerido', 'Ingresa un nombre válido.');
        return;
    }

    period.periodName = name;
    renderMasterBudgetList();
    renderBudgetDetails();

    const modalEl = document.getElementById('editBudgetPeriodModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeleteBudgetPeriod(periodId) {
    showConfirmModal('¿Eliminar Período?', 'Se eliminará el período junto con todos sus registros.', () => {
        masterBudgets = masterBudgets.filter(p => p.id !== periodId);
        if (activeBudgetPeriodId === periodId) {
            activeBudgetPeriodId = masterBudgets.length > 0 ? masterBudgets[0].id : null;
        }
        initMasterBudget();
    });
}

// ==========================================
// 2. MANTENIMIENTOS (USUARIOS, ICONOS, CATEGORÍAS)
// ==========================================

// let sysUsers = [
//     { id: 1, avatar: 'fas fa-user-tie', name: 'Admin User', email: 'admin@finanzaspro.com', role: 'Administrador' }
// ];
let sysUsers = [
    { id: 1, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', name: 'Admin Principal', email: 'admin@finanzaspro.com', role: 'Admin' },
    { id: 2, avatar: '', name: 'Juan Perez', email: 'juan@moca.com', role: 'Editor' } // Perfil de ejemplo.
];

let sysIcons = [
    { id: 1, val: 'fas fa-university', text: '🏦 Cuenta Bancaria' },
    { id: 2, val: 'fas fa-piggy-bank', text: '🐖 Alcancía' },
    { id: 3, val: 'fas fa-wallet', text: '💳 Billetera / Efectivo' },
    { id: 4, val: 'fab fa-bitcoin', text: '🪙 Criptomonedas' },
    { id: 5, val: 'fas fa-money-check-alt', text: '🧾 Cheques' },
    { id: 6, val: 'fas fa-briefcase', text: '💼 Maletín (Trabajo/Salario)' },
    { id: 7, val: 'fas fa-gift', text: '🎁 Regalo (Bonos)' },
    { id: 8, val: 'fas fa-globe-americas', text: '🌎 Mundo (Remesas)' },
    { id: 9, val: 'fas fa-car', text: '🚗 Auto' },
    { id: 10, val: 'fas fa-home', text: '🏠 Casa' },
    { id: 11, val: 'fas fa-bolt', text: '⚡ Luz Eléctrica' },
    { id: 12, val: 'fas fa-shopping-basket', text: '🛒 Compras / Mercado' },
    { id: 13, val: 'fas fa-shield-alt', text: '🛡️ Fondo de Emergencia' },
    { id: 14, val: 'fas fa-wifi', text: '📶 Internet / Servicios' }
];

let sysCategories = [
    { id: 1, desc: 'Luz Eléctrica', iconId: 'fas fa-bolt' },
    { id: 2, desc: 'Supermercado', iconId: 'fas fa-shopping-basket' },
    { id: 3, desc: 'Nómina / Salario', iconId: 'fas fa-briefcase' },
    { id: 4, desc: 'Inversión', iconId: 'fas fa-piggy-bank' },
    { id: 5, desc: 'Vivienda', iconId: 'fas fa-home' },
    { id: 6, desc: 'General', iconId: 'fas fa-wallet' }
];

let notificacionesData = [
    { id: 1, icon: 'fas fa-motorcycle text-primary', title: 'Recordatorio', text: 'Recuerda revisar el nivel de aceite 20W-50 de tu motocicleta Tauro Fénix 105 para mantenerla en óptimas condiciones locales.', time: 'Hace 2 horas' },
    { id: 2, icon: 'fas fa-map-marker-alt text-info', title: 'Seguridad', text: 'Nuevo inicio de sesión detectado en Moca, Provincia Espaillat.', time: 'Hace 5 horas' },
    { id: 3, icon: 'fas fa-chart-line text-success', title: 'Meta alcanzada', text: '¡Felicidades! Has superado el 50% de tu meta de ahorro.', time: 'Ayer' }
];

function initMaintenances() {
    renderMantUsers();
    renderMantIcons();
    renderMantCategories();
    renderNotifications();
    populateSelects();
}

function renderMantUsers() {
    const tbody = document.getElementById('table-mant-users');
    // const avatarImg = u.avatar ? `<img src="${u.avatar}" class="rounded-circle border" width="35" height="35" style="object-fit:cover;">` : `<div class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style="width:35px; height:35px;">${u.name.charAt(0).toUpperCase()}</div>`;
    if (!tbody) return;
    tbody.innerHTML = sysUsers.map(u => `
        <tr>
            <td>${u.avatar ? `<img src="${u.avatar}" class="rounded-circle border" width="35" height="35" style="object-fit:cover;">` : `<div class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style="width:35px; height:35px;">${u.name.charAt(0).toUpperCase()}</div>`}
            
            </td>
            <td class="fw-medium">${u.name}</td>
            <td class="text-muted">${u.email}</td>
            <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${u.role}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary p-1 px-2" onclick="editUser(${u.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger p-1 px-2" onclick="deleteUser(${u.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderMantIcons() {
    const grid = document.getElementById('grid-mant-icons');
    if (!grid) return;
    grid.innerHTML = sysIcons.map(icon => `
        <div class="col-4 col-ssm-4 col-md-2 col-lg-2">
            <div class="p-3 border rounded text-center position-relative" style="border-color: var(--glass-border) !important; background: var(--input-bg);">
                <i class="${icon.val} fs-3 text-primary my-3"></i>
            
                <div class="dropdown position-absolute top-0 end-0 m-2">
                    <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                        <li><button class="dropdown-item py-2" onclick="editIcon(${icon.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                        <li><button class="dropdown-item py-2 text-danger" onclick="deleteIcon(${icon.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
}

function renderMantCategories() {
    const tbody = document.getElementById('table-mant-cats');
    if (!tbody) return;
    tbody.innerHTML = sysCategories.map(cat => `
        <tr>
            <td><i class="${cat.iconId} text-primary fs-5"></i></td>
            <td class="fw-medium">${cat.desc}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary p-1 px-2"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger p-1 px-2"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');
}


// --- RENDER NOTIFICACIONES ---
function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (notificacionesData.length === 0) {
        list.innerHTML = `<p class="text-muted text-center py-4">No tienes notificaciones nuevas.</p>`;
        return;
    }

    let html = '';
    notificacionesData.forEach(n => {
        html += `
            <div class="d-flex align-items-start p-3 mb-2 rounded border" style="background: var(--input-bg);">
                <div class="fs-4 me-3">${n.icon.includes('<') ? n.icon : `<i class="${n.icon}"></i>`}</div>
                <div>
                    <h6 class="fw-bold mb-1">${n.title}</h6>
                    <p class="text-muted small mb-1">${n.text}</p>
                    <small class="text-primary fw-medium" style="font-size: 0.75rem;">${n.time}</small>
                </div>
            </div>`;
    });
    list.innerHTML = html;
}

function populateSelects() {
    // Selects de iconos
    const iconOptions = sysIcons.map(icon => `<option value="${icon.val}">${icon.text}</option>`).join('');
    ['walletIcon', 'editWalletIcon', 'goalIcon', 'editGoalIcon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = iconOptions;
    });

    // Selects de categorías
    const catOptions = sysCategories.map(cat => `<option value="${cat.id}">${cat.desc}</option>`).join('');
    ['txCategorySelect', 'editTxCategorySelect', 'budgetCategory', 'editBudgetCategory'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = catOptions;
    });
}


// USUARIOS
function openAddUserModal() {
    document.getElementById('userId').value = '';
    document.getElementById('userAvatar').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userRole').value = 'Viewer';
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
}

function editUser(id) {
    const u = sysUsers.find(x => x.id === id);
    if (!u) return;
    document.getElementById('userId').value = u.id;
    document.getElementById('userAvatar').value = u.avatar;
    document.getElementById('userName').value = u.name;
    document.getElementById('userEmail').value = u.email;
    document.getElementById('userRole').value = u.role;
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function saveUser() {
    const id = document.getElementById('userId').value;
    const data = {
        avatar: document.getElementById('userAvatar').value.trim(),
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        role: document.getElementById('userRole').value
    };
    if(!data.name || !data.email) { showAlertModal('Error', 'Nombre y Email son requeridos.'); return; }

    if (id) {
        const idx = sysUsers.findIndex(x => x.id == id);
        sysUsers[idx] = { ...sysUsers[idx], ...data };
    } else {
        sysUsers.push({ id: Date.now(), ...data });
    }
    renderMantUsers();
    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
}

function deleteUser(id) {
    showConfirmModal('¿Eliminar Usuario?', 'El usuario será removido del sistema.', () => {
        sysUsers = sysUsers.filter(x => x.id !== id);
        renderMantUsers();
    });
}

// ICONOS
function openAddIconModal() {
    document.getElementById('iconId').value = '';
    document.getElementById('iconClass').value = '';
    document.getElementById('iconDesc').value = '';
    document.getElementById('iconModalTitle').textContent = 'Nuevo Ícono';
}

function editIcon(id) {
    const i = sysIcons.find(x => x.id === id);
    if (!i) return;
    document.getElementById('iconId').value = i.id;
    document.getElementById('iconClass').value = i.val;
    document.getElementById('iconDesc').value = i.text;
    document.getElementById('iconModalTitle').textContent = 'Editar Ícono';
    new bootstrap.Modal(document.getElementById('iconModal')).show();
}

function saveIcon() {
    const id = document.getElementById('iconId').value;
    const classVal = document.getElementById('iconClass').value.trim();
    const desc = document.getElementById('iconDesc').value.trim();
    if(!classVal || !desc) { showAlertModal('Error', 'Todos los campos son obligatorios.'); return; }

    if (id) {
        const idx = sysIcons.findIndex(x => x.id == id);
        sysIcons[idx] = { ...sysIcons[idx], val: classVal, text: desc };
    } else {
        console.log(sysIcons);
        sysIcons.push({ id: sysIcons.length+2, val: classVal, text: desc });
        console.log(Math.max(...sysIcons.map(x => x.id)));
        console.log(sysIcons);

    }
    renderMantIcons();
    populateSelects(); // Actualizar listados
    bootstrap.Modal.getInstance(document.getElementById('iconModal')).hide();
}

function deleteIcon(id) {
    showConfirmModal('¿Eliminar Ícono?', 'Asegúrate de que no esté en uso.', () => {
        sysIcons = sysIcons.filter(x => x.id !== id);
        renderMantIcons();
        populateSelects();
    });
}
