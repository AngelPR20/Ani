import * as initial from './initial.js';
import * as wallets from './wallets.js';
import * as goals from './goals.js';
import * as budget from './budget.js';

import * as users from './users.js';
import * as categories from './categories.js';
import * as icons from './icons.js';


// ==========================================
// 1. NAVEGACIÓN Y CONFIGURACIÓN DE INTERFAZ
// ==========================================



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
    budget.initMasterBudget();
    goals.renderGoals();
    wallets.renderWallets();
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

    const btnDashboard = document.getElementById('btnDashboard');
    const btnWallet = document.getElementById('btnWallet');
    const btnGoal = document.getElementById('btnGoal');
    const btnBudget = document.getElementById('btnBudget');
    const btnMaintenance = document.getElementById('btnMaintenance');
    const btnSetting = document.getElementById('btnSetting');
    const btnSettingMobile = document.getElementById('btnSettingMobile');
    const btnLogout = document.getElementById('btnLogout');
    const btnLogoutMobile = document.getElementById('btnLogoutMobile');
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');
    const btnDarkModeSwitch = document.getElementById('btnDarkModeSwitch');
    const btnReturnWallets = document.getElementById('btnReturnWallets');

    const btnSaveNewWallet = document.getElementById('btnSaveNewWallet');
    const btnEditWallet = document.getElementById('btnEditWallet');

    const btnSaveNewTransaction = document.getElementById('btnSaveNewTransaction');
    const btnEditTransaction = document.getElementById('btnEditTransaction');
    const btnFilterWalletMovements = document.getElementById('btnFilterWalletMovements');
    const btnPrintWalletMovements = document.getElementById('btnPrintWalletMovements');
    const btnExportWalletMovementsExcel = document.getElementById('btnExportWalletMovementsExcel');

    const btnSaveNewGoal = document.getElementById('btnSaveNewGoal');
    const btnEditGoal = document.getElementById('btnEditGoal');

    const btnAddNewBudgetPeriodModal = document.getElementById('btnAddNewBudgetPeriodModal');
    const btnSaveNewBudgetPeriod = document.getElementById('btnSaveNewBudgetPeriod');
    const btnSaveBudgetItem = document.getElementById('btnSaveBudgetItem');
    const btnSaveEditedBudgetItem = document.getElementById('btnSaveEditedBudgetItem');
    
    const btnOpenAddIconModal = document.getElementById('btnOpenAddIconModal');
    const btnSaveIcon = document.getElementById('btnSaveIcon');

    const btnOpenAddCategoryModal = document.getElementById('btnOpenAddCategoryModal');
    const btnSaveCategory = document.getElementById('btnSaveCategory');
    
    const btnOpenAddUserModal = document.getElementById('btnOpenAddUserModal');
    const btnSaveUser = document.getElementById('btnSaveUser');


    btnDashboard.addEventListener('click', () => {
        initial.navigate('dashboard', btnDashboard);
    });
    btnWallet.addEventListener('click', () => {
        initial.navigate('carteras', btnWallet);
    });
    btnGoal.addEventListener('click', () => {
        initial.navigate('metas', btnGoal);
    });
    btnBudget.addEventListener('click', () => {
        initial.navigate('presupuesto', btnBudget);
    });
    btnMaintenance.addEventListener('click', () => {
        initial.navigate('mantenimientos', btnMaintenance);
    });
    btnSetting.addEventListener('click', () => {
        initial.navigate('configuracion', btnSetting);
    });
    btnSettingMobile.addEventListener('click', () => {
        initial.navigate('configuracion', '');
    });
    
    btnLogout.addEventListener('click', () => {
        logout();
    });
    btnToggleSidebar.addEventListener('click', () => {
        toggleDesktopSidebar();
    });
    btnLogoutMobile.addEventListener('click', () => {
        logout();
    });
    btnDarkModeSwitch.addEventListener('change', () => {
        toggleTheme();
    });
    btnReturnWallets.addEventListener('click', () => {
        initial.navigate('carteras', btnWallet);
    });

    btnSaveNewWallet.addEventListener('click', () => {
        wallets.saveNewWallet();
    });
    btnEditWallet.addEventListener('click', () => {
        wallets.saveEditedWallet();
    });

    btnSaveNewTransaction.addEventListener('click', () => {
        wallets.saveNewTransaction();
    });
    btnEditTransaction.addEventListener('click', () => {
        wallets.saveEditedTransaction();
    });
    btnFilterWalletMovements.addEventListener('click', () => {
        wallets.filterWalletMovements();
    });
    btnPrintWalletMovements.addEventListener('click', () => {
        wallets.printWalletMovements();
    });
    btnExportWalletMovementsExcel.addEventListener('click', () => {
        wallets.exportWalletMovementsExcel();
    });

    btnSaveNewGoal.addEventListener('click', () => {
        goals.saveNewGoal();
    });
    btnEditGoal.addEventListener('click', () => {
        goals.saveEditedGoal();
    });

    btnAddNewBudgetPeriodModal.addEventListener('click', () => {
        budget.addNewBudgetPeriodModal();
    });
    btnSaveNewBudgetPeriod.addEventListener('click', () => {
        budget.saveNewBudgetPeriod();
    });
    btnSaveBudgetItem.addEventListener('click', () => {
        budget.saveBudgetItem();
    });
    btnSaveEditedBudgetItem.addEventListener('click', () => {
        budget.saveEditedBudgetItem();
    });

    btnOpenAddIconModal.addEventListener('click', () => {
        icons.openAddIconModal();
    });
    btnSaveIcon.addEventListener('click', () => {
        icons.saveIcon();
    });

    btnOpenAddCategoryModal.addEventListener('click', () => {
        categories.openAddCategoryModal();
    });
    btnSaveCategory.addEventListener('click', () => {
        categories.saveCategory();
    });

    btnOpenAddUserModal.addEventListener('click', () => {
        users.openAddUserModal();
    });
    btnSaveUser.addEventListener('click', () => {
        users.saveUser();
    });

});




// ==========================================
// 2. MANTENIMIENTOS (USUARIOS, ICONOS, CATEGORÍAS)
// ==========================================

function initMaintenances() {
    users.renderMantUsers();
    icons.renderMantIcons();
    categories.renderMantCategories();
    renderNotifications();
    // populateSelects();
    initial.initCustomSelects(); // INICIAMOS LOS SELECTORES ELEGANTES
}

// --- RENDER NOTIFICACIONES ---
function renderNotifications() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (initial.notificacionesData.length === 0) {
        list.innerHTML = `<p class="text-muted text-center py-4">No tienes notificaciones nuevas.</p>`;
        return;
    }

    let html = '';
    initial.notificacionesData.forEach(n => {
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
