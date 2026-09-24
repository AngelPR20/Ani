// ==========================================
// 1. NAVEGACIÓN Y CONFIGURACIÓN DE INTERFAZ
// ==========================================

export let userWallets = [
    { 
        id: 1, 
        title: 'Banco Popular', 
        balance: 1000.00, 
        icon: 'fas fa-university', 
        affectsBalance: true, 
        desc: 'Cuenta de ahorros principal',
        movements: [
            { id: 1001, type: 'Ingreso', category: 1, desc: 'Depósito de nómina mensual', date: '2026-09-01 10:30', amount: 1500.00 },
            { id: 1003, type: 'Gasto', category: 4, desc: 'Retiro de nómina mensual', date: '2026-09-01 10:30', amount: 500.00 }
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
            { id: 1002, type: 'Ingreso', category: 2, desc: 'Rendimiento mensual de acciones', date: '2026-09-05 14:00', amount: 200.00 }
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

export let userGoals = [
    { id: 1, title: 'Auto Nuevo', target: 10000, current: 6500, icon: 'fas fa-car', desc: 'Ahorro para vehículo del año' },
    { id: 2, title: 'Vacaciones', target: 3000, current: 900, icon: 'fas fa-globe-americas', desc: 'Viaje familiar veraniego' }
];

export let masterBudgets = [
    {
        id: 1,
        periodName: 'Septiembre 2026',
        monthValue: '2026-09',
        items: [
            { id: 201, type: 'Gasto Fijo', title: 'Luz Eléctrica', amount: 85.50, affectsBalance: true, icon: 'fas fa-bolt', desc: 'Servicio eléctrico mensual' },
            { id: 202, type: 'Reserva', title: 'Fondo de Emergencia', amount: 300.00, affectsBalance: false, icon: 'fas fa-shield-alt', desc: 'Ahorro preventivo' }
        ]
    },
    {
        id: 2,
        periodName: 'Agosto 2026',
        monthValue: '2026-08',
        items: [
            { id: 203, type: 'Gasto Fijo', title: 'Alquiler', amount: 500.00, affectsBalance: true, icon: 'fas fa-home', desc: 'Pago de apartamento' }
        ]
    }
];

export let sysUsers = [
    { id: 1, avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', name: 'Admin Principal', email: 'admin@finanzaspro.com', role: 'Admin' },
    { id: 2, avatar: '', name: 'Juan Perez', email: 'juan@moca.com', role: 'Editor' } // Perfil de ejemplo.
];

export let sysIcons = [
    { id: 1, val: 'fas fa-university' },
    { id: 2, val: 'fas fa-piggy-bank' },
    { id: 3, val: 'fas fa-wallet' },
    { id: 4, val: 'fab fa-bitcoin' },
    { id: 5, val: 'fas fa-money-check-alt' },
    { id: 6, val: 'fas fa-briefcase' },
    { id: 7, val: 'fas fa-gift' },
    { id: 8, val: 'fas fa-globe-americas' },
    { id: 9, val: 'fas fa-car' },
    { id: 10, val: 'fas fa-home' },
    { id: 11, val: 'fas fa-bolt' },
    { id: 12, val: 'fas fa-shopping-basket' },
    { id: 13, val: 'fas fa-shield-alt' },
    { id: 14, val: 'fas fa-wifi' }
];

export let sysCategories = [
    { id: 1, desc: 'Luz Eléctrica', iconId: 'fas fa-bolt' },
    { id: 2, desc: 'Supermercado', iconId: 'fas fa-shopping-basket' },
    { id: 3, desc: 'Nómina / Salario', iconId: 'fas fa-briefcase' },
    { id: 4, desc: 'Inversión', iconId: 'fas fa-piggy-bank' },
    { id: 5, desc: 'Vivienda', iconId: 'fas fa-home' },
    { id: 6, desc: 'General', iconId: 'fas fa-wallet' }
];

export const notificacionesData = [
    { id: 1, icon: 'fas fa-motorcycle text-primary', title: 'Recordatorio', text: 'Recuerda revisar el nivel de aceite 20W-50 de tu motocicleta Tauro Fénix 105 para mantenerla en óptimas condiciones locales.', time: 'Hace 2 horas' },
    { id: 2, icon: 'fas fa-map-marker-alt text-info', title: 'Seguridad', text: 'Nuevo inicio de sesión detectado en Moca, Provincia Espaillat.', time: 'Hace 5 horas' },
    { id: 3, icon: 'fas fa-chart-line text-success', title: 'Meta alcanzada', text: '¡Felicidades! Has superado el 50% de tu meta de ahorro.', time: 'Ayer' }
];

export function navigate(viewId, element) {
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

// Función auxiliar para reiniciar Tooltips en elementos inyectados por JS
export function reinitTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Funciones auxiliares para modales
export function showAlertModal(title, text) {
    const titleEl = document.getElementById('alertModalTitle');
    const textEl = document.getElementById('alertModalText');
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = text;
    const modal = new bootstrap.Modal(document.getElementById('actionAlertModal'));
    modal.show();
}

export function showConfirmModal(title, text, callback) {
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

export function setUserWallets(_userWallets) {
    userWallets = _userWallets;
}

export function setUserGoals(_userGoals) {
    userGoals = _userGoals;
}

export function setMasterBudgets(_masterBudgets) {
    masterBudgets = _masterBudgets;
}

export function setSysIcons(_sysIcons) {
    sysIcons = _sysIcons;
}

export function setSysCategories(_sysCategories) {
    sysCategories = _sysCategories;
}

export function setSysUsers(_sysUsers) {
    sysUsers = _sysUsers;
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

export function initCustomSelects() {
    // Configurar cuadriculas de Iconos
    const iconInputs = ['walletIcon', 'editWalletIcon', 'goalIcon', 'editGoalIcon', 'budgetIcon', 'editBudgetIcon', 'categoryIconId'];
    iconInputs.forEach(id => {
        const container = document.getElementById(`grid-${id}`);
        if (!container) return;
        let html = '';
        sysIcons.forEach(icon => {
            html += `<div class="icon-btn bg-primary bg-opacity-10 text-primary btnSelectIcon" data-text="${icon.text}" data-val="${icon.val}" title="${icon.text}"><i class="${icon.val}"></i></div>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.btnSelectIcon').forEach((btnSelectIcon) => {
            btnSelectIcon.addEventListener('click', () => selectIcon(id, btnSelectIcon.getAttribute('data-val'), btnSelectIcon.getAttribute('data-text')));
        })
        
        // Cargar selección default inicial
        const hiddenVal = document.getElementById(id).value;
        const defaultIcon = sysIcons.find(i => i.val === hiddenVal) || sysIcons[0];
        if (defaultIcon) selectIcon(id, defaultIcon.val, defaultIcon.text, true);
    });

    // Configurar listas de Categorías
    const categoryInputs = ['txCategory', 'editTxCategory'];
    categoryInputs.forEach(id => {
        const container = document.getElementById(`list-${id}`);
        if (!container) return;
        let html = '';
        sysCategories.forEach(cat => {
            html += `
            <div class="category-pill btnSelectCategory" data-input-id=${id} data-cat-id=${cat.id} data-cat-desc=${cat.desc} data-cat-iconId="${cat.iconId}">
                <div class="bg-primary bg-opacity-10 text-primary rounded p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i class="${cat.iconId}"></i></div>
                <span class="fw-medium">${cat.desc}</span>
            </div>`;
        });
        container.innerHTML = html;

        container.querySelectorAll('.btnSelectCategory').forEach(btnSelectCategory => {
            btnSelectCategory.addEventListener('click', () => {
                selectCategory(btnSelectCategory.getAttribute('data-input-id'), btnSelectCategory.getAttribute('data-cat-id'), btnSelectCategory.getAttribute('data-cat-desc'), btnSelectCategory.getAttribute('data-cat-iconId'));
            });
        });
    });
}

export function selectIcon(inputId, iconVal, iconText, init = false) {
    document.getElementById(inputId).value = iconVal;
    // const btnText = iconText.split(' ')[1] || iconText; // Para no mostrar todo muy largo
    
    document.getElementById(`btn-${inputId}`).innerHTML = `<span><i class="${iconVal} me-2 text-primary"></i></span> <i class="fas fa-chevron-down"></i>`;
    
    if (!init) {
        const btn = document.getElementById(`btn-${inputId}`);
        const dropdown = bootstrap.Dropdown.getInstance(btn);
        if (dropdown) dropdown.hide();
    }
}

export function selectCategory(inputId, catId, catDesc, catIcon, init = false) {

    document.getElementById(inputId).value = catId; 
    document.getElementById(`btn-${inputId}`).innerHTML = `<span><i class="${catIcon} text-primary me-2"></i> ${catDesc}</span> <i class="fas fa-chevron-down"></i>`;
    
    if (!init) {
        const btn = document.getElementById(`btn-${inputId}`);
        const dropdown = bootstrap.Dropdown.getInstance(btn);
        if (dropdown) dropdown.hide();
    }
}

// function initCustomSelects() {
//     // Configurar cuadriculas de Iconos
//     const iconInputs = ['walletIcon', 'editWalletIcon', 'goalIcon', 'editGoalIcon', 'budgetIcon', 'editBudgetIcon', 'categoryIconId'];
//     iconInputs.forEach(id => {
//         const container = document.getElementById(`grid-${id}`);
//         if (!container) return;
//         let html = '';
//         sysIcons.forEach(icon => {
//             html += `<div class="icon-btn bg-primary bg-opacity-10 text-primary" onclick="selectIcon('${id}', '${icon.val}', '${icon.text}')" title="${icon.text}"><i class="${icon.val}"></i></div>`;
//         });
//         container.innerHTML = html;
        
//         // Cargar selección default inicial
//         const hiddenVal = document.getElementById(id).value;
//         const defaultIcon = sysIcons.find(i => i.val === hiddenVal) || sysIcons[0];
//         if (defaultIcon) selectIcon(id, defaultIcon.val, defaultIcon.text, true);
//     });

//     // Configurar listas de Categorías
//     const categoryInputs = ['txCategory', 'editTxCategory'];
//     categoryInputs.forEach(id => {
//         const container = document.getElementById(`list-${id}`);
//         if (!container) return;
//         let html = '';
//         sysCategories.forEach(cat => {
//             html += `
//             <div class="category-pill" onclick="selectCategory('${id}', '${cat.id}', '${cat.desc}', '${cat.iconId}')">
//                 <div class="bg-primary bg-opacity-10 text-primary rounded p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;"><i class="${cat.iconId}"></i></div>
//                 <span class="fw-medium">${cat.desc}</span>
//             </div>`;
//         });
//         container.innerHTML = html;
//     });
// }




// function selectIcon(inputId, iconVal, iconText, init = false) {
//     document.getElementById(inputId).value = iconVal;
//     // const btnText = iconText.split(' ')[1] || iconText; // Para no mostrar todo muy largo
    
//     document.getElementById(`btn-${inputId}`).innerHTML = `<span><i class="${iconVal} me-2 text-primary"></i></span> <i class="fas fa-chevron-down"></i>`;
    
//     if (!init) {
//         const btn = document.getElementById(`btn-${inputId}`);
//         const dropdown = bootstrap.Dropdown.getInstance(btn);
//         if (dropdown) dropdown.hide();
//     }
// }

// function selectCategory(inputId, catId, catDesc, catIcon, init = false) {
//     document.getElementById(inputId).value = catId; 
//     document.getElementById(`btn-${inputId}`).innerHTML = `<span><i class="${catIcon} text-primary me-2"></i> ${catDesc}</span> <i class="fas fa-chevron-down"></i>`;
    
//     if (!init) {
//         const btn = document.getElementById(`btn-${inputId}`);
//         const dropdown = bootstrap.Dropdown.getInstance(btn);
//         if (dropdown) dropdown.hide();
//     }
// }