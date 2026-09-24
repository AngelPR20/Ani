import * as initial from './initial.js';
import * as dashboard from './dashboard.js';

// ==========================================
// 5. MÓDULO DE PRESUPUESTO (BUDGETS)
// ==========================================

const spanishMonthsCap = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Convierte el valor de un input type="month" (formato "YYYY-MM") en un nombre de período legible, ej. "Enero 2027".
function monthValueToLabel(monthValue) {
    if (!monthValue) return '';
    const [y, m] = monthValue.split('-');
    const idx = parseInt(m, 10) - 1;
    const monthName = spanishMonthsCap[idx] || '';
    return monthName ? `${monthName} ${y}` : '';
}

// Intenta reconstruir el valor "YYYY-MM" a partir de un nombre de período existente (para períodos antiguos
// creados antes de usar el selector de mes/año, y así poder precargarlos al editar).
function labelToMonthValue(label) {
    if (!label) return null;
    const match = label.trim().match(/^([A-Za-zÁÉÍÓÚñÑáéíóú]+)\s+(\d{4})$/);
    if (!match) return null;
    const monthName = match[1].toLowerCase();
    const year = match[2];
    const idx = spanishMonthsCap.findIndex(m => m.toLowerCase() === monthName);
    if (idx === -1) return null;
    return `${year}-${String(idx + 1).padStart(2, '0')}`;
}

let activeBudgetPeriodId = null;

export function initMasterBudget() {
    if (initial.masterBudgets.length > 0 && !activeBudgetPeriodId) {
        activeBudgetPeriodId = initial.masterBudgets[0].id;
    }
    renderMasterBudgetList();
    renderBudgetDetails();
}

export function renderMasterBudgetList() {
    const container = document.getElementById('master-month-list');
    if (!container) return;

    if (initial.masterBudgets.length === 0) {
        container.innerHTML = `<p class="text-muted small text-center py-3">No hay períodos creados.</p>`;
        return;
    }

    let html = '';
    initial.masterBudgets.forEach(period => {
        const isActive = period.id == activeBudgetPeriodId;
        const activeClass = isActive ? 'btn-primary shadow-sm' : 'btn-outline-secondary';

        html += `
            <div class="d-flex align-items-center gap-1">
                <button class="btn ${activeClass} w-100 text-start py-2 px-3 btnSelectBudgetPeriod" style="border-radius: 10px;" data-id=${period.id}>
                    <i class="fas fa-calendar-alt me-2"></i>${period.periodName}
                </button>
                <div class="dropdown">
                    <button class="btn btn-sm btn-link text-muted px-2" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                        <li><button class="dropdown-item py-2 btnOpenEditBudgetPeriodModal" data-id=${period.id}><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                        <li><button class="dropdown-item py-2 text-danger btnConfirmDeleteBudgetPeriod" data-id=${period.id}><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                    </ul>
                </div>
            </div>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.btnSelectBudgetPeriod').forEach(btnSelectBudgetPeriod => {
        btnSelectBudgetPeriod.addEventListener('click', () => {
            selectBudgetPeriod(btnSelectBudgetPeriod.getAttribute('data-id'));
        });
    });
    container.querySelectorAll('.btnOpenEditBudgetPeriodModal').forEach(btnOpenEditBudgetPeriodModal => {
        btnOpenEditBudgetPeriodModal.addEventListener('click', () => {
            openEditBudgetPeriodModal(btnOpenEditBudgetPeriodModal.getAttribute('data-id'));
        });
    });
    container.querySelectorAll('.btnConfirmDeleteBudgetPeriod').forEach(btnConfirmDeleteBudgetPeriod => {
        btnConfirmDeleteBudgetPeriod.addEventListener('click', () => {
            confirmDeleteBudgetPeriod(btnConfirmDeleteBudgetPeriod.getAttribute('data-id'));
        });
    });
}

export function selectBudgetPeriod(periodId) {
    activeBudgetPeriodId = periodId;
    renderMasterBudgetList();
    renderBudgetDetails();
}

export function renderBudgetDetails() {
    const titleEl = document.getElementById('detail-month-title');
    const tableBody = document.getElementById('budget-table-body');
    const cardsContainer = document.getElementById('budget-cards-container');
    const totalFixedEl = document.getElementById('totalFixedExpenses');
    const totalReservesEl = document.getElementById('totalReserves');
    const totalAffectingEl = document.getElementById('totalAffectingBalance');
    const addNewItemBtn = document.getElementById('addNewItemBtn');
    if (addNewItemBtn) addNewItemBtn.style.display = '';


    const period = initial.masterBudgets.find(p => p.id == activeBudgetPeriodId);

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
            ? `<button type="button" class="btn btn-sm btn-link text-info p-0 shadow-none" data-bs-toggle="tooltip" data-bs-placement="top" title="${item.desc}"><i class="fas fa-info-circle fs-6"></i></button>`
            : `<span class="text-muted small mt-1">-</span>`;

        const affectsBadge = item.affectsBalance 
            ? '<span class="text-success small fw-medium"><i class="fas fa-check-circle me-1"></i>Sí</span>' 
            : '<span class="text-muted small fw-medium"><i class="fas fa-times-circle me-1"></i>No</span>';

        const affectsBadgeCards = item.affectsBalance 
            ? '<span class="text-success small fw-medium" data-bs-toggle="tooltip" data-bs-placement="top" title="Afecta Balance: Sí"><i class="fas fa-check-circle me-1 fs-6"></i></span>' 
            : '<span class="text-muted small fw-medium" data-bs-toggle="tooltip" data-bs-placement="top" title="Afecta Balance: No"><i class="fas fa-times-circle me-1 fs-6"></i></span>';

        tableHtml += `
            <tr>
                <td class="py-3 text-nowrap">${typeBadge}</td>
                <td class="py-3 fw-medium text-nowrap"><i class="${item.icon} me-2 text-primary"></i>${item.title}</td>
                <td class="py-3 text-center text-nowrap print-hide">${descIconHtml}</td>
                <td class="py-3 text-nowrap text-center">${affectsBadge}</td>
                <td class="py-3 fw-bold text-nowrap">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                <td class="py-3 text-end text-nowrap">
                    <button class="btn btn-sm btn-outline-primary p-1 px-2 btnOpenEditBudgetItemModal" data-id=${item.id}><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger p-1 px-2 btnConfirmDeleteBudgetItem" data-id=${item.id}><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>`;

        cardsHtml += `
            <div class="col-12">
                <div class="glass px-3 py-2 d-flex justify-content-between align-items-center shadow-none border-0 border-top border-bottom rounded-0">
                    
                
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <div class="mb-2">${typeBadge}</div>
                            ${affectsBadgeCards}
                            ${descIconHtml}
                        </div>
                        <h6 class="fw-bold my-2"><i class="${item.icon} me-2 text-primary"></i>${item.title}</h6>
                        <h5 class="mb-2">$${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</h5>
                    </div>
                    <div class="text-end">
                        <div>
                            <button class="btn btn-sm btn-outline-primary p-1 px-2 btnOpenEditBudgetItemModal" data-id=${item.id}><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-outline-danger p-1 px-2 btnConfirmDeleteBudgetItem" data-id=${item.id}><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    if (tableBody) tableBody.innerHTML = tableHtml;
    if (cardsContainer) cardsContainer.innerHTML = cardsHtml;

    tableBody.querySelectorAll('.btnOpenEditBudgetItemModal').forEach(btnOpenEditBudgetItemModal => {
        btnOpenEditBudgetItemModal.addEventListener('click', () => {
            openEditBudgetItemModal(btnOpenEditBudgetItemModal.getAttribute('data-id'));
        });
    });
    tableBody.querySelectorAll('.btnConfirmDeleteBudgetItem').forEach(btnConfirmDeleteBudgetItem => {
        btnConfirmDeleteBudgetItem.addEventListener('click', () => {
            confirmDeleteBudgetItem(btnConfirmDeleteBudgetItem.getAttribute('data-id'));
        });
    });

    cardsContainer.querySelectorAll('.btnOpenEditBudgetItemModal').forEach(btnOpenEditBudgetItemModal => {
        btnOpenEditBudgetItemModal.addEventListener('click', () => {
            openEditBudgetItemModal(btnOpenEditBudgetItemModal.getAttribute('data-id'));
        });
    });
    cardsContainer.querySelectorAll('.btnConfirmDeleteBudgetItem').forEach(btnConfirmDeleteBudgetItem => {
        btnConfirmDeleteBudgetItem.addEventListener('click', () => {
            confirmDeleteBudgetItem(btnConfirmDeleteBudgetItem.getAttribute('data-id'));
        });
    });
}

export function saveBudgetItem() {
    const period = initial.masterBudgets.find(p => p.id === activeBudgetPeriodId);
    if (!period) {
        initial.showAlertModal('Error', 'Selecciona un período de presupuesto válido.');
        return;
    }

    const type = document.getElementById('budgetType').value;
    const title = document.getElementById('budgetTitle').value.trim();
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    const icon = document.getElementById('budgetIcon').value;
    const affectsBalance = document.getElementById('budgetAffectsBalance').checked;
    const desc = document.getElementById('budgetDesc').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
        initial.showAlertModal('Datos incompletos', 'Por favor ingresa un título y un monto válido.');
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
    dashboard.renderDashboardSummary();

    document.getElementById('budgetTitle').value = '';
    document.getElementById('budgetAmount').value = '';
    document.getElementById('budgetDesc').value = '';

    const modalEl = document.getElementById('addBudgetItemModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingBudgetItemId = null;

export function openEditBudgetItemModal(itemId) {
    let targetItem = null;
    let targetPeriod = null;

    initial.masterBudgets.forEach(p => {
        const found = p.items.find(i => i.id == itemId);
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
    document.getElementById('btn-editBudgetIcon').innerHTML = `<span><i class="${targetItem.icon} me-2 text-primary"></i></span> <i class="fas fa-chevron-down"></i>`;

    document.getElementById('editBudgetAffectsBalance').checked = targetItem.affectsBalance;
    document.getElementById('editBudgetDesc').value = targetItem.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editBudgetItemModal'));
    modal.show();
}

export function saveEditedBudgetItem() {
    let targetItem = null;
    let oldPeriod = null;

    initial.masterBudgets.forEach(p => {
        const found = p.items.find(i => i.id == currentEditingBudgetItemId);
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
    dashboard.renderDashboardSummary();

    const modalEl = document.getElementById('editBudgetItemModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

export function confirmDeleteBudgetItem(itemId) {
    initial.showConfirmModal('¿Eliminar Gasto/Reserva?', 'Esta acción eliminará el registro de este presupuesto.', () => {
        initial.masterBudgets.forEach(p => {
            p.items = p.items.filter(i => i.id != itemId);
        });
        renderBudgetDetails();
        dashboard.renderDashboardSummary();
    });
}

export function addNewBudgetPeriodModal() {
    const input = document.getElementById('newPeriodMonthInput');
    if (input) input.value = '';
    const modal = new bootstrap.Modal(document.getElementById('addBudgetPeriodModal'));
    modal.show();
}

export function saveNewBudgetPeriod() {
    const input = document.getElementById('newPeriodMonthInput');
    const monthValue = input ? input.value : '';

    if (!monthValue) {
        initial.showAlertModal('Mes requerido', 'Por favor selecciona el mes y año del presupuesto.');
        return;
    }

    const name = monthValueToLabel(monthValue);

    const alreadyExists = initial.masterBudgets.some(p => {
        if (p.monthValue) return p.monthValue === monthValue;
        return (p.periodName || '').trim().toLowerCase() === name.toLowerCase();
    });

    if (alreadyExists) {
        initial.showAlertModal('Período existente', `Ya existe un período registrado para ${name}.`);
        return;
    }

    const newPeriod = {
        id: Date.now(),
        periodName: name,
        monthValue,
        items: []
    };

    initial.masterBudgets.push(newPeriod);
    activeBudgetPeriodId = newPeriod.id;
    renderMasterBudgetList();
    renderBudgetDetails();
    dashboard.renderDashboardSummary();

    const modalEl = document.getElementById('addBudgetPeriodModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingPeriodId = null;

export function openEditBudgetPeriodModal(periodId) {
    const period = initial.masterBudgets.find(p => p.id == periodId);
    if (!period) return;

    currentEditingPeriodId = periodId;
    const input = document.getElementById('editPeriodMonthInput');
    if (input) input.value = period.monthValue || labelToMonthValue(period.periodName) || '';

    const modal = new bootstrap.Modal(document.getElementById('editBudgetPeriodModal'));
    modal.show();
}

export function saveEditedBudgetPeriod() {
    const period = initial.masterBudgets.find(p => p.id == currentEditingPeriodId);
    if (!period) return;

    const input = document.getElementById('editPeriodMonthInput');
    const monthValue = input ? input.value : '';

    if (!monthValue) {
        initial.showAlertModal('Mes requerido', 'Por favor selecciona el mes y año del presupuesto.');
        return;
    }

    const name = monthValueToLabel(monthValue);

    const alreadyExists = initial.masterBudgets.some(p => {
        if (p.id === period.id) return false;
        if (p.monthValue) return p.monthValue === monthValue;
        return (p.periodName || '').trim().toLowerCase() === name.toLowerCase();
    });

    if (alreadyExists) {
        initial.showAlertModal('Período existente', `Ya existe un período registrado para ${name}.`);
        return;
    }

    period.periodName = name;
    period.monthValue = monthValue;
    renderMasterBudgetList();
    renderBudgetDetails();
    dashboard.renderDashboardSummary();

    const modalEl = document.getElementById('editBudgetPeriodModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

export function confirmDeleteBudgetPeriod(periodId) {
    initial.showConfirmModal('¿Eliminar Período?', 'Se eliminará el período junto con todos sus registros.', () => {
        initial.setMasterBudgets(initial.masterBudgets.filter(p => p.id != periodId));
        if (activeBudgetPeriodId == periodId) {
            activeBudgetPeriodId = initial.masterBudgets.length > 0 ? initial.masterBudgets[0].id : null;
        }
        initMasterBudget();
        dashboard.renderDashboardSummary();
    });
}