import * as initial from './initial.js';
import * as dashboard from './dashboard.js';

// ==========================================
// 4. MÓDULO DE METAS (GOALS)
// ==========================================

export function renderGoals() {
    const container = document.getElementById('goals-container');
    const overallBadge = document.getElementById('overallAverageBadge');
    const headerNewGoalBtn = document.getElementById('headerNewGoalBtn');
    const overallAverageBadge = document.getElementById('overallAverageBadge');
    
    if (!container) return;

    if (initial.userGoals.length === 0) {
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

    initial.userGoals.forEach(goal => {
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
                                        <li><button class="dropdown-item py-2 btnOpenEditGoalModal" data-id=${goal.id}><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                        <li><button class="dropdown-item py-2 text-danger btnConfirmDeleteGoal" data-id=${goal.id}><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
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
    container.querySelectorAll('.btnOpenEditGoalModal').forEach(btnOpenEditGoalModal => {
        btnOpenEditGoalModal.addEventListener('click', () => {
            openEditGoalModal(btnOpenEditGoalModal.getAttribute('data-id'));
        });
    });
    container.querySelectorAll('.btnConfirmDeleteGoal').forEach(btnConfirmDeleteGoal => {
        btnConfirmDeleteGoal.addEventListener('click', () => {
            confirmDeleteGoal(btnConfirmDeleteGoal.getAttribute('data-id'));
        });
    });

    if (overallBadge) {
        const avg = totalPercent / initial.userGoals.length;
        overallBadge.textContent = `Promedio General: ${avg.toFixed(2)}%`;
    }
    
    initial.reinitTooltips();
}

export function saveNewGoal() {
    const title = document.getElementById('goalTitle').value.trim();
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    const icon = document.getElementById('goalIcon').value;
    const desc = document.getElementById('goalDesc').value.trim();

    if (!title || isNaN(target) || target <= 0) {
        showAlertModal('Datos incompletos', 'Por favor ingresa un título y un monto objetivo válido.');
        return;
    }

    initial.userGoals.push({
        id: Date.now(),
        title,
        target,
        current,
        icon,
        desc
    });

    renderGoals();
    dashboard.renderDashboard();

    document.getElementById('goalTitle').value = '';
    document.getElementById('goalTarget').value = '';
    document.getElementById('goalCurrent').value = '0';
    document.getElementById('goalDesc').value = '';

    const modalEl = document.getElementById('addGoalModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

let currentEditingGoalId = null;

export function openEditGoalModal(goalId) {
    const goal = initial.userGoals.find(g => g.id == goalId);
    if (!goal) return;

    currentEditingGoalId = goalId;
    document.getElementById('editGoalTitle').value = goal.title;
    document.getElementById('editGoalTarget').value = goal.target;
    document.getElementById('editGoalCurrent').value = goal.current;
    document.getElementById('editGoalIcon').value = goal.icon;
    document.getElementById('btn-editGoalIcon').innerHTML = `<span><i class="${goal.icon} me-2 text-primary"></i></span> <i class="fas fa-chevron-down"></i>`;
    document.getElementById('editGoalDesc').value = goal.desc || '';

    const modal = new bootstrap.Modal(document.getElementById('editGoalModal'));
    modal.show();
}

export function saveEditedGoal() {
    const goal = initial.userGoals.find(g => g.id == currentEditingGoalId);
    if (!goal) return;

    goal.title = document.getElementById('editGoalTitle').value.trim();
    goal.target = parseFloat(document.getElementById('editGoalTarget').value);
    goal.current = parseFloat(document.getElementById('editGoalCurrent').value) || 0;
    goal.icon = document.getElementById('editGoalIcon').value;
    goal.desc = document.getElementById('editGoalDesc').value.trim();

    renderGoals();
    dashboard.renderDashboard();

    const modalEl = document.getElementById('editGoalModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

export function confirmDeleteGoal(goalId) {
    initial.showConfirmModal('¿Eliminar Meta?', '¿Estás seguro de eliminar esta meta financiera?', () => {

        initial.setUserGoals(initial.userGoals.filter(g => g.id != goalId));
        renderGoals();
        dashboard.renderDashboard();
    });
}