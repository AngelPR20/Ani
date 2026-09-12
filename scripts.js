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
        document.querySelectorAll('.sidebar-content .nav-item-custom').forEach(nav => {
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


// ==========================================
// 2. INICIALIZACIÓN DE GRÁFICOS Y TOOLTIPS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar switch de tema oscuro según estado actual
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) {
        darkModeSwitch.checked = (localStorage.getItem('finanzaspro_theme') === 'dark');
    }

    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar datos de módulos al cargar
    initMasterBudget();
    renderGoals();
    renderWallets();

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
                plugins: {
                    legend: { position: 'bottom' }
                },
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
                plugins: {
                    legend: { position: 'bottom' }
                }
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
        balance: 250.00, 
        icon: 'fas fa-wallet', 
        affectsBalance: true, 
        desc: 'Dinero en billetera',
        movements: [
            { id: 1003, type: 'Gasto', category: 'Alimentación', desc: 'Compra de almuerzo en restaurante', date: '2026-09-10 12:15', amount: 25.00 }
        ]
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
                    <h5 class="fw-bold">No tienes carteras registradas</h5>
                    <p class="text-muted small mb-3">Crea tu primera cuenta para comenzar a organizar tu dinero.</p>
                    <button class="btn btn-sm btn-primary px-3 py-2" style="border-radius: 10px;" data-bs-toggle="modal" data-bs-target="#addWalletModal">
                        <i class="fas fa-plus me-2"></i>Nueva Cartera
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
                                    <div class="d-flex align-items-center gap-1 flex-wrap mb-1">
                                        <h5 class="fw-bold mb-0">${wallet.title}</h5>
                                        <small class="text-muted d-block" style="min-height: 20px;">${wallet.desc || 'Sin descripción'}</small>
                                    </div>
                                    ${badgeAffects}
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><button class="dropdown-item py-2" onclick="openEditWalletModal(${wallet.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                    <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeleteWallet(${wallet.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-4 pt-2 border-top border-secondary d-flex justify-content-between align-items-center" style="border-opacity: 0.1;">
                            <div>
                                <span class="text-muted small d-block mb-1">Balance Actual</span>
                                <h3 class="fw-bold mb-0">$${formattedBalance}</h3>
                            </div>
                            <button class="btn btn-sm btn-outline-primary px-3 py-2" style="border-radius: 8px;" onclick="openWalletMovementsPage(${wallet.id})">
                                <i class="fas fa-list-alt me-1"></i> Ver Movimientos
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
}

let activeWalletForMovements = null;

function openWalletMovementsPage(walletId) {
    const wallet = userWallets.find(w => w.id === walletId);
    if (!wallet) return;

    activeWalletForMovements = wallet;

    const titleEl = document.getElementById('pageWalletMovementsTitle');
    const subtitleEl = document.getElementById('pageWalletMovementsSubtitle');
    if (titleEl) titleEl.textContent = `Movimientos de: ${wallet.title}`;
    if (subtitleEl) subtitleEl.textContent = wallet.desc || 'Gestión y control de transacciones de la cartera.';

    // Asignar por defecto los últimos 30 días de diferencia entre hasta (hoy) y desde (hace 30 días)
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

// Función robusta para exportar a Excel usando la librería externa SheetJS (xlsx)
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

    // Preparar filas para la hoja de Excel
    const dataToExport = movements.map(m => ({
        'Tipo': m.type,
        'Categoría (Concepto)': m.category || 'General',
        'Monto ($)': m.amount,
        'Fecha y Hora': m.date,
        'Descripción': m.desc || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    // Generar archivo y descargar automáticamente
    const safeTitle = activeWalletForMovements.title.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(workbook, `Movimientos_${safeTitle}.xlsx`);
}

function renderWalletMovementsTable() {
    const tbody = document.getElementById('page-wallet-movements-table-body');
    if (!tbody || !activeWalletForMovements) return;

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
        movements = movements.filter(m => {
            const mDateStr = m.date.split(' ')[0];
            return mDateStr >= fromDateVal;
        });
    } else if (toDateVal) {
        movements = movements.filter(m => {
            const mDateStr = m.date.split(' ')[0];
            return mDateStr <= toDateVal;
        });
    }

    if (movements.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron movimientos con los filtros seleccionados.</td></tr>`;
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
        
        // Icono tooltip para la descripción opcional
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
                <td class="py-3 text-center text-nowrap">${descIconHtml}</td>
                <td class="py-3 text-end text-nowrap">
                    <button class="btn btn-sm btn-link text-primary p-1" onclick="openEditTransactionModal(${mov.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteTransaction(${mov.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;

    // Reactivar tooltips nuevos en la tabla
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Registrar Transacción vinculada automáticamente a la cartera activa con fecha y hora separadas
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

    // Combinar fecha y hora o asignar la actual si están vacías
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

    // Alterar balance de la cartera
    if (type === 'Ingreso') {
        activeWalletForMovements.balance += amount;
    } else {
        activeWalletForMovements.balance -= amount;
    }

    renderWallets();
    renderWalletMovementsTable();

    // Limpiar campos del modal
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

    // Revertir efecto anterior en balance
    if (mov.type === 'Ingreso') {
        activeWalletForMovements.balance -= mov.amount;
    } else {
        activeWalletForMovements.balance += mov.amount;
    }

    // Aplicar nuevo efecto en balance
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
        movements: balance > 0 ? [{ id: Date.now(), type: 'Ingreso', desc: 'Balance inicial', date: '2026-09-12 12:23', amount: balance }] : []
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
    if (!container) return;

    if (userGoals.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-4 text-muted">No hay metas registradas.</div>`;
        if (overallBadge) overallBadge.textContent = 'Promedio General: 0.00%';
        return;
    }

    let html = '';
    let totalPercent = 0;

    userGoals.forEach(goal => {
        let percent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        if (percent > 100) percent = 100;
        totalPercent += percent;

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
                                <div>
                                    <h5 class="fw-bold mb-0">${goal.title}</h5>
                                    <small class="text-muted">${goal.desc || 'Sin descripción'}</small>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><button class="dropdown-item py-2" onclick="openEditGoalModal(${goal.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                    <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeleteGoal(${goal.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                                </ul>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="fw-medium text-muted">Progreso</span>
                            <span class="fw-bold text-primary">${percent.toFixed(1)}%</span>
                        </div>
                        <div class="progress mb-2" style="height: 8px; border-radius: 10px; background: var(--input-bg);">
                            <div class="progress-bar bg-primary" style="width: ${percent}%; border-radius: 10px;"></div>
                        </div>
                        <small class="text-muted d-block">$${formattedCurrent} de $${formattedTarget}</small>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    if (overallBadge) {
        const avg = totalPercent / userGoals.length;
        overallBadge.textContent = `Promedio General: ${avg.toFixed(2)}%`;
    }
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
        const activeClass = isActive ? 'btn-primary shadow-sm' : 'btn-outline-secondary border-0';

        html += `
            <div class="d-flex align-items-center gap-1">
                <button class="btn ${activeClass} w-100 text-start py-2 px-3 fw-medium" style="border-radius: 10px;" onclick="selectBudgetPeriod(${period.id})">
                    <i class="fas fa-calendar-alt me-2"></i>${period.periodName}
                </button>
                <div class="dropdown">
                    <button class="btn btn-sm btn-link text-muted px-2" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                        <li><button class="dropdown-item py-2" onclick="openEditBudgetPeriodModal(${period.id})"><i class="fas fa-edit me-2 text-primary"></i>Editar Período</button></li>
                        <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeleteBudgetPeriod(${period.id})"><i class="fas fa-trash-alt me-2"></i>Eliminar Período</button></li>
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

    const period = masterBudgets.find(p => p.id === activeBudgetPeriodId);

    if (!period) {
        if (titleEl) titleEl.textContent = 'Seleccione un Período';
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Ningún período seleccionado.</td></tr>`;
        if (cardsContainer) cardsContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted">Ningún período seleccionado.</div>`;
        if (totalFixedEl) totalFixedEl.textContent = '$0.00';
        if (totalReservesEl) totalReservesEl.textContent = '$0.00';
        if (totalAffectingEl) totalAffectingEl.textContent = '$0.00';
        return;
    }

    if (titleEl) titleEl.textContent = `Período: ${period.periodName}`;

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
        
        const affectsBadge = item.affectsBalance 
            ? '<span class="text-success small fw-medium"><i class="fas fa-check-circle me-1"></i>Sí</span>' 
            : '<span class="text-muted small fw-medium"><i class="fas fa-times-circle me-1"></i>No</span>';

        tableHtml += `
            <tr>
                <td class="py-3 text-nowrap">${typeBadge}</td>
                <td class="py-3 fw-medium text-nowrap"><i class="${item.icon} me-2 text-primary"></i>${item.title}</td>
                <td class="py-3 text-nowrap">${affectsBadge}</td>
                <td class="py-3 fw-bold text-nowrap">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-end text-nowrap">
                    <button class="btn btn-sm btn-link text-primary p-1" onclick="openEditBudgetItemModal(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteBudgetItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;

        cardsHtml += `
            <div class="col-12">
                <div class="glass p-3 d-flex justify-content-between align-items-center">
                    <div>
                        <div class="mb-1">${typeBadge}</div>
                        <h6 class="fw-bold mb-1"><i class="${item.icon} me-2 text-primary"></i>${item.title}</h6>
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

    // Llenar select de períodos en modal de edición
    const selectMonth = document.getElementById('editBudgetMonth');
    if (selectMonth) {
        let opts = '';
        masterBudgets.forEach(p => {
            opts += `<option value="${p.id}" ${p.id === targetPeriod.id ? 'selected' : ''}>${p.periodName}</option>`;
        });
        selectMonth.innerHTML = opts;
    }

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

    const newPeriodId = parseInt(document.getElementById('editBudgetMonth').value);
    const newPeriod = masterBudgets.find(p => p.id === newPeriodId);
    if (!newPeriod) return;

    targetItem.type = document.getElementById('editBudgetType').value;
    targetItem.title = document.getElementById('editBudgetTitle').value.trim();
    targetItem.amount = parseFloat(document.getElementById('editBudgetAmount').value);
    targetItem.icon = document.getElementById('editBudgetIcon').value;
    targetItem.affectsBalance = document.getElementById('editBudgetAffectsBalance').checked;
    targetItem.desc = document.getElementById('editBudgetDesc').value.trim();

    if (oldPeriod.id !== newPeriod.id) {
        oldPeriod.items = oldPeriod.items.filter(i => i.id !== currentEditingBudgetItemId);
        newPeriod.items.push(targetItem);
    }

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