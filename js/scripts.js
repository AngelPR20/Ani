import * as initial from './initial.js';
import * as wallets from './wallets.js';
import * as goals from './goals.js';
import * as budget from './budget.js';
import * as dashboard from './dashboard.js';

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

function initMaintenances() {
    users.renderMantUsers();
    icons.renderMantIcons();
    categories.renderMantCategories();
    renderNotifications();
    // populateSelects();
    initial.initCustomSelects(); // INICIAMOS LOS SELECTORES ELEGANTES

    // Detectar el cambio en el tipo de transacción
    const txTypeElement = document.getElementById('txType');
    const txBudgetWrapper = document.getElementById('txBudgetWrapper');

    if (txTypeElement) {
        txTypeElement.addEventListener('change', function() {
            // Verifica si el valor seleccionado es "Gasto" (ajusta el string según el value de tu HTML)
            if (this.value === 'Gasto' || this.value === 'expense') {
                txBudgetWrapper.style.display = 'block';
                populateBudgetItemsForTransaction();
            } else {
                txBudgetWrapper.style.display = 'none';
                document.getElementById('txBudgetItem').value = ''; // Limpiar la selección
            }
        });
    }
}

    // Función para llenar dinámicamente el selector con los items de presupuesto no pagados
function populateBudgetItemsForTransaction() {
    const selectEl = document.getElementById('txBudgetItem');
    if (!selectEl) return;

    // Reiniciar las opciones manteniendo la opción por defecto
    selectEl.innerHTML = '<option value="">No vincular a presupuesto</option>';

    // Obtener el período de presupuesto activo
    // const period = initial.masterBudgets;
    const period = initial.masterBudgets.find(p => p.id == 1);

    if (period && period.items) {
        // Filtrar solo los items que NO están pagados
        const pendingItems = period.items.filter(item => !item.paid);
        
        pendingItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.title} ($${item.amount.toLocaleString('en-US', {minimumFractionDigits: 2})})`;
            selectEl.appendChild(option);
        });
    }
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

// Vincula un switch de preferencia a una clave de localStorage: carga su estado guardado
// y persiste cualquier cambio que el usuario haga.
function initPreferenceSwitch(elementId, storageKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.checked = localStorage.getItem(storageKey) === 'true';
    el.addEventListener('change', () => {
        localStorage.setItem(storageKey, el.checked);
    });
}

// Configura la carga de foto de perfil (selección manual o arrastrar y soltar) con vista previa circular.
// La misma imagen se refleja también en el avatar del sidebar y del mobile-header.
function initProfilePhotoUpload() {
    const dropzone = document.getElementById('profileAvatarDropzone');
    const preview = document.getElementById('profileAvatarPreview');
    const fileInput = document.getElementById('profileAvatarInput');
    const changeBtn = document.getElementById('btnChangeProfilePhoto');
    const sidebarAvatar = document.getElementById('sidebarUserAvatar');
    const mobileHeaderAvatar = document.getElementById('mobileHeaderUserAvatar');

    if (!dropzone || !preview || !fileInput) return;

    const loadFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            if (sidebarAvatar) sidebarAvatar.src = e.target.result;
            if (mobileHeaderAvatar) mobileHeaderAvatar.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    if (changeBtn) {
        changeBtn.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            loadFile(fileInput.files[0]);
        }
    });

    ['dragenter', 'dragover'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('dropzone-active');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('dropzone-active');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            loadFile(e.dataTransfer.files[0]);
        }
    });
}

// Sincroniza el nombre completo capturado en el Perfil de Usuario con el nombre visible en el sidebar.
function initProfileNameSync() {
    const nameInput = document.getElementById('profileNameInput');
    const saveBtn = document.getElementById('btnSaveProfile');
    const sidebarName = document.getElementById('sidebarUserName');
    const sidebarUserInfo = document.getElementById('sidebarUserInfo');


    if (!nameInput || !sidebarName) return;

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name)
                sidebarName.textContent = name;
                sidebarUserInfo.dataset['tooltip'] = name;
        });
    }
}

// ==========================================
// 2. INICIALIZACIÓN DE GRÁFICOS Y TOOLTIPS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar switch de tema oscuro según estado actual
    const darkModeSwitch = document.getElementById('btnDarkModeSwitch');
    if (darkModeSwitch) {
        darkModeSwitch.checked = (localStorage.getItem('finanzaspro_theme') === 'dark');
    }

    // Inicializar preferencias de notificaciones (Configuración)
    initPreferenceSwitch('btnPushNotifSwitch', 'finanzaspro_push_notifications');
    initPreferenceSwitch('btnEmailNotifSwitch', 'finanzaspro_email_notifications');
    initPreferenceSwitch('btnBudgetRemindersSwitch', 'finanzaspro_budget_reminders');

    // Inicializar carga de foto de perfil (Configuración)
    initProfilePhotoUpload();
    initProfileNameSync();

    // Los gráficos de Ingresos vs Gastos y Distribución de Gastos ahora son dinámicos
    // y se inicializan/actualizan desde dashboard.js (ver dashboard.renderDashboard()).

    reinitTooltips();

    // Inicializar datos de módulos al cargar
    budget.initMasterBudget();
    goals.renderGoals();
    wallets.renderWallets();
    wallets.initTransactionModalEvents();
    initMaintenances();
    dashboard.renderDashboard();

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
    const btnViewAllMovements = document.getElementById('btnViewAllMovements');

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
    const btnSaveEditedBudgetPeriod = document.getElementById('btnSaveEditedBudgetPeriod');

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
    if (btnViewAllMovements) {
        btnViewAllMovements.addEventListener('click', () => {
            wallets.openAllWalletsMovementsPage();
        });
    }

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
    btnSaveEditedBudgetPeriod.addEventListener('click', () => {
        budget.saveEditedBudgetPeriod();
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