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
            { id: 1001, type: 'Ingreso', desc: 'Depósito de nómina', date: '2026-09-01 10:30', amount: 1500.00 }
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
            { id: 1002, type: 'Ingreso', desc: 'Rendimiento mensual', date: '2026-09-05 14:00', amount: 200.00 }
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
            { id: 1003, type: 'Gasto', desc: 'Compra de almuerzo', date: '2026-09-10 12:15', amount: 25.00 }
        ]
    }
];

function renderWallets() {
    const container = document.getElementById('wallets-container');
    const headerNewWalletBtn = document.getElementById('headerNewWalletBtn');
    const txWalletSelect = document.getElementById('txWalletSelect');
    
    if (!container) return;

    // Actualizar selector de carteras en el modal de transacciones
    if (txWalletSelect) {
        let optionsHtml = '';
        userWallets.forEach(w => {
            optionsHtml += `<option value="${w.id}">${w.title} (Balance: $${w.balance.toLocaleString('en-US', {minimumFractionDigits: 2})})</option>`;
        });
        txWalletSelect.innerHTML = optionsHtml;
    }

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
                                    <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                                        <h5 class="fw-bold mb-0">${wallet.title}</h5>
                                        ${badgeAffects}
                                    </div>
                                    <small class="text-muted d-block" style="min-height: 20px;">${wallet.desc || 'Sin descripción'}</small>
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

    // Inicializar fechas de filtro amplias (por defecto últimos 30 días o histórico)
    const inputFrom = document.getElementById('filterDateFrom');
    const inputTo = document.getElementById('filterDateTo');

    if (inputFrom) inputFrom.value = '';
    if (inputTo) inputTo.value = '';

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

function exportWalletMovementsExcel() {
    if (!activeWalletForMovements) return;
    showAlertModal('Exportar a Excel', `Generando archivo Excel (.xlsx) con los movimientos de la cartera: ${activeWalletForMovements.title}.`);
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
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No se encontraron movimientos con los filtros seleccionados.</td></tr>`;
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

        html += `
            <tr>
                <td class="py-3 text-nowrap">${typeIcon} <span class="ms-2 fw-medium">${mov.type}</span></td>
                <td class="py-3 fw-medium text-nowrap">${mov.desc}</td>
                <td class="py-3 fw-bold ${amountColor} text-nowrap">${amountPrefix}$${mov.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-muted small text-nowrap">${mov.date}</td>
                <td class="py-3 text-end text-nowrap">
                    <button class="btn btn-sm btn-link text-primary p-1" onclick="openEditTransactionModal(${mov.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteTransaction(${mov.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
}

// Registrar Transacción (Funcionamiento Completo y Actualización de Cartera)
function saveNewTransaction() {
    const walletId = parseInt(document.getElementById('txWalletSelect').value);
    const type = document.getElementById('txType').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    const dateTimeInput = document.getElementById('txDateTime').value;
    const desc = document.getElementById('txDesc').value.trim();

    const wallet = userWallets.find(w => w.id === walletId);
    if (!wallet) {
        showAlertModal('Error', 'Debe seleccionar una cartera válida.');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        showAlertModal('Monto inválido', 'Por favor ingresa un monto mayor a cero.');
        return;
    }

    if (!desc) {
        showAlertModal('Concepto requerido', 'Por favor ingresa una descripción o concepto para la transacción.');
        return;
    }

    // Formatear fecha y hora
    let formattedDate = '';
    if (dateTimeInput) {
        formattedDate = dateTimeInput.replace('T', ' ');
    } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    const newMov = {
        id: Date.now(),
        type,
        desc,
        date: formattedDate,
        amount
    };

    if (!wallet.movements) wallet.movements = [];
    wallet.movements.push(newMov);

    // Alterar balance de la cartera
    if (type === 'Ingreso') {
        wallet.balance += amount;
    } else {
        wallet.balance -= amount;
    }

    renderWallets();
    if (activeWalletForMovements && activeWalletForMovements.id === wallet.id) {
        renderWalletMovementsTable();
    }

    // Limpiar campos del modal
    document.getElementById('txAmount').value = '';
    document.getElementById('txDesc').value = '';
    document.getElementById('txDateTime').value = '';

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
    document.getElementById('editTxDesc').value = mov.desc;
    document.getElementById('editTxDateTime').value = mov.date.replace(' ', 'T');

    const modal = new bootstrap.Modal(document.getElementById('editTransactionModal'));
    modal.show();
}

function saveEditedTransaction() {
    if (!activeWalletForMovements) return;
    const mov = activeWalletForMovements.movements.find(m => m.id === currentEditingTransactionId);
    if (!mov) return;

    const newType = document.getElementById('editTxType').value;
    const newAmount = parseFloat(document.getElementById('editTxAmount').value);
    const newDesc = document.getElementById('editTxDesc').value.trim();
    const newDateTime = document.getElementById('editTxDateTime').value.replace('T', ' ');

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
    mov.desc = newDesc;
    mov.date = newDateTime || mov.date;

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
// 4. MÓDULO DE METAS FINANCIERAS
// ==========================================

let financialGoals = [
    { id: 1, title: 'Auto Nuevo', target: 10000.00, current: 6500.00, icon: 'fas fa-car', desc: 'Ahorro para inicial del vehículo' },
    { id: 2, title: 'Vacaciones', target: 3000.00, current: 900.00, icon: 'fas fa-globe-americas', desc: 'Viaje de fin de año' }
];

function renderGoals() {
    const container = document.getElementById('goals-container');
    const badge = document.getElementById('overallAverageBadge');
    const headerNewGoalBtn = document.getElementById('headerNewGoalBtn');
    
    if (!container) return;

    if (financialGoals.length === 0) {
        if (headerNewGoalBtn) headerNewGoalBtn.style.display = 'none';
        if (badge) badge.style.display = 'none';

        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="p-4 d-inline-block" style="border-radius: 16px;">
                    <i class="fas fa-bullseye fa-3x text-muted mb-3"></i>
                    <h5 class="fw-bold">No tienes metas registradas</h5>
                    <p class="text-muted small mb-3">Crea tu primera meta financiera para comenzar a monitorear tus objetivos.</p>
                    <button class="btn btn-sm btn-primary px-3 py-2" style="border-radius: 10px;" data-bs-toggle="modal" data-bs-target="#addGoalModal">
                        <i class="fas fa-plus me-2"></i>Crear Meta
                    </button>
                </div>
            </div>`;
        return;
    } else {
        if (headerNewGoalBtn) headerNewGoalBtn.style.display = '';
        if (badge) badge.style.display = '';
    }

    let html = '';
    let totalPercentageSum = 0;

    financialGoals.forEach(goal => {
        let percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        
        if (percentage >= 100 && goal.current < goal.target) {
            percentage = 99.99;
        }

        totalPercentageSum += percentage;

        let percentageStr = percentage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let currentStr = goal.current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let targetStr = goal.target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        let textColorClass = '';
        let bgColorClass = '';
        if (percentage <= 25.00) {
            textColorClass = 'grad-text-red';
            bgColorClass = 'grad-bg-red';
        } else if (percentage <= 50.00) {
            textColorClass = 'grad-text-orange';
            bgColorClass = 'grad-bg-orange';
        } else if (percentage <= 75.00) {
            textColorClass = 'grad-text-lgreen';
            bgColorClass = 'grad-bg-lgreen';
        } else {
            textColorClass = 'grad-text-green';
            bgColorClass = 'grad-bg-green';
        }

        html += `
            <div class="col-md-6 col-xl-4">
                <div class="glass p-4 h-100 d-flex flex-column justify-content-between position-relative">
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
                        <div class="d-flex justify-content-end">
                            <h4 class="fw-bold ${textColorClass}">${percentageStr}%</h4>
                        </div>
                        <div class="progress mb-3" style="height: 8px; border-radius: 10px; background: var(--input-bg);">
                            <div class="progress-bar ${bgColorClass}" style="width: ${percentage > 100 ? 100 : percentage}%; border-radius: 10px;"></div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center border-secondary" style="border-opacity: 0.1;">
                        <span class="text-muted small">Alcanzado: <strong class="text-body">$${currentStr}</strong></span>
                        <span class="text-muted small">Meta: <strong class="text-body">$${targetStr}</strong></span>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = html;
    if (badge) {
        const overallAvg = financialGoals.length > 0 ? (totalPercentageSum / financialGoals.length) : 0;
        badge.textContent = `Promedio General: ${overallAvg.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%`;
    }
}

function saveNewGoal() {
    const title = document.getElementById('goalTitle').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    const icon = document.getElementById('goalIcon').value;
    const desc = document.getElementById('goalDesc').value.trim();

    if (!title || isNaN(target) || target <= 0) {
        showAlertModal('Datos incompletos', 'Por favor ingresa un título válido y un monto objetivo mayor a cero.');
        return;
    }

    const newGoal = {
        id: Date.now(),
        title,
        target,
        current,
        icon,
        desc
    };

    financialGoals.push(newGoal);
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

function openEditGoalModal(id) {
    const goal = financialGoals.find(g => g.id === id);
    if (!goal) return;

    currentEditingGoalId = id;
    document.getElementById('editGoalTitle').value = goal.title;
    document.getElementById('editGoalTarget').value = goal.target;
    document.getElementById('editGoalCurrent').value = goal.current;
    document.getElementById('editGoalIcon').value = goal.icon;
    document.getElementById('editGoalDesc').value = goal.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editGoalModal'));
    modal.show();
}

function saveEditedGoal() {
    const goal = financialGoals.find(g => g.id === currentEditingGoalId);
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

function confirmDeleteGoal(id) {
    showConfirmModal('¿Eliminar meta?', 'Esta acción eliminará la meta financiera permanentemente.', () => {
        financialGoals = financialGoals.filter(g => g.id !== id);
        renderGoals();
    });
}


// ==========================================
// 5. MÓDULO DE PRESUPUESTOS (MAESTRO-DETALLE)
// ==========================================

let budgetData = {
    "Septiembre": [
        { id: 101, type: 'Gasto Fijo', title: 'Luz Eléctrica', amount: 85.50, affectsBalance: true, icon: 'fas fa-bolt', desc: 'Consumo EDE' },
        { id: 102, type: 'Reserva', title: 'Fondo de Emergencia', amount: 200.00, affectsBalance: true, icon: 'fas fa-shield-alt', desc: 'Ahorro mensual' }
    ],
    "Octubre": [
        { id: 201, type: 'Gasto Fijo', title: 'Alquiler', amount: 500.00, affectsBalance: true, icon: 'fas fa-home', desc: 'Pago mensual' }
    ],
    "Noviembre": [],
    "Diciembre": []
};

let activeBudgetMonth = "Septiembre";

function initMasterBudget() {
    renderMasterMonths();
    renderBudgetDetail();
}

function renderMasterMonths() {
    const listContainer = document.getElementById('master-month-list');
    if (!listContainer) return;

    let html = '';
    const months = Object.keys(budgetData);

    if (months.length === 0) {
        listContainer.innerHTML = `<p class="text-muted small text-center my-3">No hay períodos creados. Haz clic en "Nuevo Período" para comenzar.</p>`;
        return;
    }

    months.forEach(month => {
        const isActive = (month === activeBudgetMonth);
        const textClass = isActive ? 'text-white' : 'text-body';

        html += `
            <div class="d-flex align-items-center justify-content-between rounded month-item-row ${isActive ? 'bg-primary text-white shadow-sm' : 'glass'}">
                <div class="d-flex align-items-center p-2 flex-grow-1" style="cursor: pointer;" onclick="selectBudgetMonth('${month}')">
                    <i class="fas fa-calendar-alt me-2 ${isActive ? 'text-white' : 'text-primary'}"></i>
                    <span class="fw-medium ${textClass}">${month}</span>
                </div>
                <div class="dropdown">
                    <button class="btn btn-sm btn-link ${isActive ? 'text-white' : 'text-muted'} px-2 py-1 me-1" data-bs-toggle="dropdown" data-bs-boundary="window"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                        <li><button class="dropdown-item py-2" onclick="openEditPeriodModal('${month}')"><i class="fas fa-edit me-2 text-primary"></i>Renombrar</button></li>
                        <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeletePeriod('${month}')"><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                    </ul>
                </div>
            </div>`;
    });

    listContainer.innerHTML = html;
}

function selectBudgetMonth(month) {
    activeBudgetMonth = month;
    renderMasterMonths();
    renderBudgetDetail();
}

function renderBudgetDetail() {
    const titleEl = document.getElementById('detail-month-title');
    const tableBody = document.getElementById('budget-table-body');
    const cardsContainer = document.getElementById('budget-cards-container');
    const totalFixedEl = document.getElementById('totalFixedExpenses');
    const totalReservesEl = document.getElementById('totalReserves');
    const totalAffectingEl = document.getElementById('totalAffectingBalance');
    const addNewItemBtn = document.getElementById('addNewItemBtn');

    const months = Object.keys(budgetData);

    if (months.length === 0 || !activeBudgetMonth || !budgetData[activeBudgetMonth]) {
        if (titleEl) titleEl.textContent = `Detalles: Sin período seleccionado`;
        if (totalFixedEl) totalFixedEl.textContent = `$0.00`;
        if (totalReservesEl) totalReservesEl.textContent = `$0.00`;
        if (totalAffectingEl) totalAffectingEl.textContent = `$0.00`;
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Crea un período nuevo para comenzar.</td></tr>`;
        if (cardsContainer) cardsContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted">Crea un período nuevo para comenzar.</div>`;
        if (addNewItemBtn) addNewItemBtn.style.display = 'none';
        return;
    }

    if (addNewItemBtn) addNewItemBtn.style.display = 'inline-block';
    if (titleEl) titleEl.textContent = `Detalles: ${activeBudgetMonth}`;

    const items = budgetData[activeBudgetMonth] || [];

    let totalFixed = 0;
    let totalReserves = 0;
    let totalAffecting = 0;

    items.forEach(item => {
        if (item.type === 'Gasto Fijo') totalFixed += item.amount;
        if (item.type === 'Reserva') totalReserves += item.amount;
        if (item.affectsBalance) totalAffecting += item.amount;
    });

    if (totalFixedEl) totalFixedEl.textContent = `$${totalFixed.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (totalReservesEl) totalReservesEl.textContent = `$${totalReserves.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    if (totalAffectingEl) totalAffectingEl.textContent = `$${totalAffecting.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    if (items.length === 0) {
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay registros para este período.</td></tr>`;
        }
        if (cardsContainer) {
            cardsContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted">No hay registros para este período.</div>`;
        }
        return;
    }

    let tableHtml = '';
    let cardsHtml = '';

    items.forEach(item => {
        const typeBadge = item.type === 'Gasto Fijo' 
            ? '<span class="badge bg-danger bg-opacity-10 text-danger px-2 py-1 rounded text-nowrap">Gasto Fijo</span>' 
            : '<span class="badge bg-info bg-opacity-10 text-info px-2 py-1 rounded text-nowrap">Reserva</span>';

        const affectsBadge = item.affectsBalance 
            ? '<span class="text-success fw-bold text-nowrap"><i class="fas fa-check-circle me-1"></i> Sí</span>' 
            : '<span class="text-muted text-nowrap"><i class="fas fa-times-circle me-1"></i> No</span>';

        tableHtml += `
            <tr>
                <td class="py-3 text-nowrap">${typeBadge}</td>
                <td class="py-3 text-nowrap">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded p-2 me-3"><i class="${item.icon}"></i></div>
                        <div>
                            <span class="fw-bold d-block">${item.title}</span>
                            <small class="text-muted">${item.desc || ''}</small>
                        </div>
                    </div>
                </td>
                <td class="py-3 text-nowrap">${affectsBadge}</td>
                <td class="py-3 fw-bold text-nowrap">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-end text-nowrap">
                    <button class="btn btn-sm btn-link text-primary p-1" onclick="openEditBudgetItem(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteBudgetItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;

        cardsHtml += `
            <div class="col-12">
                <div class="glass p-3 rounded d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded p-3 me-3 fs-5"><i class="${item.icon}"></i></div>
                        <div>
                            <div class="mb-1">${typeBadge}</div>
                            <h6 class="fw-bold mb-0">${item.title}</h6>
                            <small class="text-muted d-block">${item.desc || 'Sin descripción'}</small>
                            <span class="small text-muted mt-1 d-block">Afecta Balance: ${item.affectsBalance ? 'Sí' : 'No'}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        <h5 class="fw-bold text-body mb-2">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</h5>
                        <div>
                            <button class="btn btn-sm btn-link text-primary p-1" onclick="openEditBudgetItem(${item.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteBudgetItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    if (tableBody) tableBody.innerHTML = tableHtml;
    if (cardsContainer) cardsContainer.innerHTML = cardsHtml;
}

function saveBudgetItem() {
    if (!activeBudgetMonth || !budgetData[activeBudgetMonth]) {
        showAlertModal('Sin período', 'Por favor selecciona o crea un período maestro antes de agregar registros.');
        return;
    }

    const type = document.getElementById('budgetType').value;
    const title = document.getElementById('budgetTitle').value.trim();
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const icon = document.getElementById('budgetIcon').value;
    const affectsBalance = document.getElementById('budgetAffectsBalance').checked;
    const desc = document.getElementById('budgetDesc').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
        showAlertModal('Datos incompletos', 'Por favor ingresa un título y un monto válido mayor a cero.');
        return;
    }

    const newItem = {
        id: Date.now(),
        type,
        title,
        amount,
        icon,
        affectsBalance,
        desc
    };

    budgetData[activeBudgetMonth].push(newItem);
    renderBudgetDetail();

    document.getElementById('budgetTitle').value = '';
    document.getElementById('budgetAmount').value = '';
    document.getElementById('budgetDesc').value = '';
    document.getElementById('budgetAffectsBalance').checked = true;

    const modalEl = document.getElementById('addBudgetItemModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingBudgetItemId = null;

function openEditBudgetItem(id) {
    let foundItem = null;
    let foundMonth = null;

    for (const [month, items] of Object.entries(budgetData)) {
        const item = items.find(i => i.id === id);
        if (item) {
            foundItem = item;
            foundMonth = month;
            break;
        }
    }

    if (!foundItem) return;

    currentEditingBudgetItemId = id;

    const editMonthSelect = document.getElementById('editBudgetMonth');
    if (editMonthSelect) {
        let optionsHtml = '';
        Object.keys(budgetData).forEach(m => {
            optionsHtml += `<option value="${m}" ${m === foundMonth ? 'selected' : ''}>${m}</option>`;
        });
        editMonthSelect.innerHTML = optionsHtml;
    }

    document.getElementById('editBudgetType').value = foundItem.type;
    document.getElementById('editBudgetTitle').value = foundItem.title;
    document.getElementById('editBudgetAmount').value = foundItem.amount;
    document.getElementById('editBudgetIcon').value = foundItem.icon;
    document.getElementById('editBudgetAffectsBalance').checked = foundItem.affectsBalance;
    document.getElementById('editBudgetDesc').value = foundItem.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editBudgetItemModal'));
    modal.show();
}

function saveEditedBudgetItem() {
    let sourceMonth = null;
    let itemIndex = -1;
    let itemObj = null;

    for (const [month, items] of Object.entries(budgetData)) {
        const index = items.findIndex(i => i.id === currentEditingBudgetItemId);
        if (index !== -1) {
            sourceMonth = month;
            itemIndex = index;
            itemObj = items[index];
            break;
        }
    }

    if (!itemObj) return;

    const targetMonth = document.getElementById('editBudgetMonth').value;

    itemObj.type = document.getElementById('editBudgetType').value;
    itemObj.title = document.getElementById('editBudgetTitle').value.trim();
    itemObj.amount = parseFloat(document.getElementById('editBudgetAmount').value);
    itemObj.icon = document.getElementById('editBudgetIcon').value;
    itemObj.affectsBalance = document.getElementById('editBudgetAffectsBalance').checked;
    itemObj.desc = document.getElementById('editBudgetDesc').value.trim();

    if (sourceMonth !== targetMonth) {
        budgetData[sourceMonth].splice(itemIndex, 1);
        if (!budgetData[targetMonth]) budgetData[targetMonth] = [];
        budgetData[targetMonth].push(itemObj);
        activeBudgetMonth = targetMonth;
    }

    renderMasterMonths();
    renderBudgetDetail();

    const modalEl = document.getElementById('editBudgetItemModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeleteBudgetItem(id) {
    showConfirmModal('¿Eliminar registro?', 'Esta acción eliminará el ítem de presupuesto permanentemente.', () => {
        for (const [month, items] of Object.entries(budgetData)) {
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                items.splice(index, 1);
                break;
            }
        }
        renderBudgetDetail();
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
    const periodName = input ? input.value.trim() : '';

    if (!periodName) {
        showAlertModal('Campo vacío', 'Por favor ingresa un nombre para el período.');
        return;
    }

    if (budgetData[periodName]) {
        showAlertModal('Período existente', 'Ya existe un período con ese nombre.');
        return;
    }

    budgetData[periodName] = [];
    activeBudgetMonth = periodName;
    renderMasterMonths();
    renderBudgetDetail();

    const modalEl = document.getElementById('addBudgetPeriodModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingPeriodName = null;

function openEditPeriodModal(month) {
    currentEditingPeriodName = month;
    const input = document.getElementById('editPeriodNameInput');
    if (input) input.value = month;

    const modal = new bootstrap.Modal(document.getElementById('editBudgetPeriodModal'));
    modal.show();
}

function saveEditedBudgetPeriod() {
    const input = document.getElementById('editPeriodNameInput');
    const newName = input ? input.value.trim() : '';

    if (!newName || newName === currentEditingPeriodName) {
        const modalEl = document.getElementById('editBudgetPeriodModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        return;
    }

    if (budgetData[newName]) {
        showAlertModal('Nombre en uso', 'Ya existe otro período con ese nombre.');
        return;
    }

    const newBudgetData = {};
    for (const [m, items] of Object.entries(budgetData)) {
        if (m === currentEditingPeriodName) {
            newBudgetData[newName] = items;
        } else {
            newBudgetData[m] = items;
        }
    }

    budgetData = newBudgetData;
    if (activeBudgetMonth === currentEditingPeriodName) {
        activeBudgetMonth = newName;
    }

    renderMasterMonths();
    renderBudgetDetail();

    const modalEl = document.getElementById('editBudgetPeriodModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function confirmDeletePeriod(month) {
    showConfirmModal('¿Eliminar período?', `¿Estás seguro de eliminar todo el período "${month}" y sus registros?`, () => {
        delete budgetData[month];
        const remainingMonths = Object.keys(budgetData);
        if (remainingMonths.length > 0) {
            activeBudgetMonth = remainingMonths[0];
        } else {
            activeBudgetMonth = null;
        }
        renderMasterMonths();
        renderBudgetDetail();
    });
}


// ==========================================
// 6. MODALES AUXILIARES DE ALERTA Y CONFIRMACIÓN
// ==========================================

function showAlertModal(title, text) {
    const titleEl = document.getElementById('alertModalTitle');
    const textEl = document.getElementById('alertModalText');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;

    const modal = new bootstrap.Modal(document.getElementById('actionAlertModal'));
    modal.show();
}

function showConfirmModal(title, text, onConfirmCallback) {
    const titleEl = document.getElementById('confirmModalTitle');
    const textEl = document.getElementById('confirmModalText');
    const confirmBtn = document.getElementById('confirmModalBtn');

    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;

    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', () => {
        const modalEl = document.getElementById('actionConfirmModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        if (onConfirmCallback) onConfirmCallback();
    });

    const modal = new bootstrap.Modal(document.getElementById('actionConfirmModal'));
    modal.show();
}