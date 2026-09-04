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
// 2. INICIALIZACIÓN DE GRÁFICOS (CHART.JS)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar switch de tema oscuro según estado actual
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) {
        darkModeSwitch.checked = (localStorage.getItem('finanzaspro_theme') === 'dark');
    }

    // Inicializar datos simulados de presupuestos y metas al cargar
    initMasterBudget();
    renderGoals();

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
// 3. MÓDULO DE METAS FINANCIERAS
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
        // Ocultar botón y badge cuando no hay metas
        if (headerNewGoalBtn) headerNewGoalBtn.style.display = 'none';
        if (badge) badge.style.display = 'none';

        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="p-4 d-inline-block" style="border-radius: 16px;">
                    <i class="fas fa-bullseye fa-3x text-muted mb-3"></i>
                    <h5 class="fw-bold">No tienes metas registradas</h5>
                    <p class="text-muted small mb-3">Crea tu primera meta financiera para comenzar a monitorear tus objetivos.</p>
                    <button class="btn btn-primary px-4 py-2" style="border-radius: 10px;" data-bs-toggle="modal" data-bs-target="#addGoalModal">
                        <i class="fas fa-plus me-2"></i>Crear Meta
                    </button>
                </div>
            </div>`;
        return;
    } else {
        // Mostrar botón y badge si hay metas
        if (headerNewGoalBtn) headerNewGoalBtn.style.display = '';
        if (badge) badge.style.display = '';
    }

    let html = '';
    let totalPercentageSum = 0;

    financialGoals.forEach(goal => {
        let percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        
        // Evitar redondear a 100% si lo alcanzado es menor a la meta
        if (percentage >= 100 && goal.current < goal.target) {
            percentage = 99.99;
        }

        totalPercentageSum += percentage;

        let percentageStr = percentage.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let currentStr = goal.current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        let targetStr = goal.target.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Lógica de gradientes por porcentaje (respetando los intervalos con decimales)
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
                                <ul class="dropdown-menu dropdown-menu-end glass border-0 shadow">
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

    // Limpiar formulario y cerrar modal
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
// 4. MÓDULO DE PRESUPUESTOS (MAESTRO-DETALLE)
// ==========================================

let budgetData = {
    "Septiembre": [
        { id: 101, type: 'Gasto Fijo', title: 'Luz Eléctrica', amount: 85.50, affectsBalance: true, icon: 'fas fa-bolt', desc: 'Consumo EDE' },
        { id: 102, type: 'Reserva', title: 'Fondo de Emergencia', amount: 200.00, affectsBalance: true, icon: 'fas fa-shield-alt', desc: 'Ahorro mensual' }
    ],
    "Octubre": [
        { id: 201, type: 'Gasto Fijo', title: 'Alquiler / Vivienda', amount: 500.00, affectsBalance: true, icon: 'fas fa-home', desc: 'Pago mensual' }
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

        // data-bs-boundary="window" asegura que el menú sobrepase el contenedor con desbordamiento
        html += `
            <div class="d-flex align-items-center justify-content-between p-2 rounded month-item-row ${isActive ? 'bg-primary text-white shadow-sm' : 'glass'}">
                <div class="d-flex align-items-center px-2 flex-grow-1" style="cursor: pointer;" onclick="selectBudgetMonth('${month}')">
                    <i class="fas fa-calendar-alt me-2 ${isActive ? 'text-white' : 'text-primary'}"></i>
                    <span class="fw-medium ${textClass}">${month}</span>
                </div>
                <div class="dropdown">
                    <button class="btn btn-sm btn-link ${isActive ? 'text-white' : 'text-muted'} px-2 py-1 me-1" data-bs-toggle="dropdown" data-bs-boundary="window"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end glass border-0 shadow">
                        <li><button class="dropdown-item py-2" onclick="openEditPeriodModal('${month}')"><i class="fas fa-edit me-2 text-primary"></i>Renombrar Período</button></li>
                        <li><button class="dropdown-item py-2 text-danger" onclick="confirmDeletePeriod('${month}')"><i class="fas fa-trash-alt me-2"></i>Eliminar Período</button></li>
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
            ? '<span class="badge bg-danger bg-opacity-10 text-danger px-2 py-1 rounded">Gasto Fijo</span>' 
            : '<span class="badge bg-info bg-opacity-10 text-info px-2 py-1 rounded">Reserva</span>';

        const affectsBadge = item.affectsBalance 
            ? '<span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i> Sí</span>' 
            : '<span class="text-muted"><i class="fas fa-times-circle me-1"></i> No</span>';

        // Vista Tabla (Escritorio)
        tableHtml += `
            <tr>
                <td class="py-3">${typeBadge}</td>
                <td class="py-3">
                    <div class="d-flex align-items-center">
                        <div class="bg-primary bg-opacity-10 text-primary rounded p-2 me-3"><i class="${item.icon}"></i></div>
                        <div>
                            <span class="fw-bold d-block">${item.title}</span>
                            <small class="text-muted">${item.desc || ''}</small>
                        </div>
                    </div>
                </td>
                <td class="py-3">${affectsBadge}</td>
                <td class="py-3 text-end fw-bold">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-end">
                    <button class="btn btn-sm btn-link text-primary p-1" onclick="openEditBudgetItem(${item.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-link text-danger p-1" onclick="confirmDeleteBudgetItem(${item.id})"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;

        // Vista Tarjetas (Móvil)
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

    // Limpiar formulario y cerrar modal
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

    // Poblar selector de meses en el modal de edición
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

    // Si cambió de mes, moverlo en la estructura maestro-detalle
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

    // Reasignar claves manteniendo el orden
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
// 5. MODALES AUXILIARES DE ALERTA Y CONFIRMACIÓN
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

    // Clonar el botón para limpiar eventos anteriores
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
