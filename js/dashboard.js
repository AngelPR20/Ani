import * as initial from './initial.js';

// ==========================================
// 6. MÓDULO DE DASHBOARD (RESUMEN GENERAL)
// ==========================================

const spanishMonths = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function formatCurrency(amount) {
    return `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function isSameMonth(dateStr, now) {
    if (!dateStr) return false;
    const datePart = dateStr.split(' ')[0];
    const parts = datePart.split('-');
    if (parts.length < 2) return false;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    return year === now.getFullYear() && (month - 1) === now.getMonth();
}

// Intenta ubicar el período de presupuesto correspondiente al mes/año actual
// buscando coincidencia por nombre (Ej: "Septiembre 2026").
function getCurrentMonthBudgetTotal() {
    const now = new Date();
    const monthName = spanishMonths[now.getMonth()];
    const year = String(now.getFullYear());

    const period = initial.masterBudgets.find(p => {
        const name = (p.periodName || '').toLowerCase();
        return name.includes(monthName) && name.includes(year);
    });

    if (!period) return 0;
    return period.items.reduce((sum, item) => sum + (item.amount || 0), 0);
}

// Muestra el difuminado inferior de una lista con scroll solo cuando hay contenido
// oculto por debajo (es decir, cuando NO se está al final del scroll).
function setupScrollFade(listId) {
    const list = document.getElementById(listId);
    if (!list) return;
    const wrapper = list.closest('.dash-scroll-fade');
    if (!wrapper) return;

    const update = () => {
        const isScrollable = list.scrollHeight > list.clientHeight + 1;
        const atBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 1;
        wrapper.classList.toggle('show-fade', isScrollable && !atBottom);
    };

    if (!list.dataset.fadeBound) {
        list.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        list.dataset.fadeBound = 'true';
    }

    // Se pospone al siguiente frame para asegurar que el layout ya refleje el nuevo contenido.
    requestAnimationFrame(update);
}

let barChartInstance = null;
let doughnutChartInstance = null;

const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Suma los ingresos y gastos de todas las carteras, agrupados por mes, para el año indicado.
function computeMonthlyTotals(year) {
    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);

    initial.userWallets.forEach(wallet => {
        (wallet.movements || []).forEach(mov => {
            if (!mov.date) return;
            const parts = mov.date.split(' ')[0].split('-');
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            if (y !== year || isNaN(m)) return;
            if (mov.type === 'Ingreso') {
                incomeByMonth[m] += mov.amount || 0;
            } else {
                expenseByMonth[m] += mov.amount || 0;
            }
        });
    });

    return { incomeByMonth, expenseByMonth };
}

// Suma los gastos de todas las carteras, agrupados por categoría.
function computeExpenseByCategory() {
    const totalsByCat = {};
    initial.userWallets.forEach(wallet => {
        (wallet.movements || []).forEach(mov => {
            if (mov.type !== 'Gasto') return;
            const catObj = initial.sysCategories.find(c => c.id == mov.category);
            const label = catObj ? catObj.desc : (mov.category || 'General');
            totalsByCat[label] = (totalsByCat[label] || 0) + (mov.amount || 0);
        });
    });
    return totalsByCat;
}

const doughnutPalette = [
    'rgba(13, 110, 253, 0.8)',
    'rgba(25, 135, 84, 0.8)',
    'rgba(255, 193, 7, 0.8)',
    'rgba(13, 202, 240, 0.8)',
    'rgba(220, 53, 69, 0.8)',
    'rgba(111, 66, 193, 0.8)',
    'rgba(253, 126, 20, 0.8)'
];

// --- GRÁFICO: INGRESOS VS GASTOS ANUALES ---
export function renderBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const year = new Date().getFullYear();
    const { incomeByMonth, expenseByMonth } = computeMonthlyTotals(year);

    if (barChartInstance) {
        barChartInstance.data.datasets[0].data = incomeByMonth;
        barChartInstance.data.datasets[1].data = expenseByMonth;
        barChartInstance.update();
        return;
    }

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomeByMonth,
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderRadius: 6
                },
                {
                    label: 'Gastos',
                    data: expenseByMonth,
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

// --- GRÁFICO: DISTRIBUCIÓN DE GASTOS POR CATEGORÍA ---
export function renderDoughnutChart() {
    const ctx = document.getElementById('doughnutChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const totalsByCat = computeExpenseByCategory();
    const labels = Object.keys(totalsByCat);
    const data = Object.values(totalsByCat);
    let colors = labels.map((_, i) => doughnutPalette[i % doughnutPalette.length]);

    if (labels.length === 0) {
        labels.push('Sin gastos registrados');
        data.push(1);
        colors = ['rgba(148, 163, 184, 0.4)'];
    }

    if (doughnutChartInstance) {
        doughnutChartInstance.data.labels = labels;
        doughnutChartInstance.data.datasets[0].data = data;
        doughnutChartInstance.data.datasets[0].backgroundColor = colors;
        doughnutChartInstance.update();
        return;
    }

    doughnutChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
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

// --- TARJETAS DE RESUMEN SUPERIOR ---
export function renderDashboardSummary() {
    const now = new Date();

    let totalBalance = 0;
    let totalIncomeMonth = 0;
    let totalExpenseMonth = 0;

    initial.userWallets.forEach(wallet => {
        if (wallet.affectsBalance) {
            totalBalance += wallet.balance || 0;
        }
        (wallet.movements || []).forEach(mov => {
            if (!isSameMonth(mov.date, now)) return;
            if (mov.type === 'Ingreso') {
                totalIncomeMonth += mov.amount || 0;
            } else {
                totalExpenseMonth += mov.amount || 0;
            }
        });
    });

    const budgetedMonth = getCurrentMonthBudgetTotal();
    const available = totalBalance - budgetedMonth;

    const elBalance = document.getElementById('dashTotalBalance');
    const elBudgeted = document.getElementById('dashBudgetedMonth');
    const elIncome = document.getElementById('dashTotalIncome');
    const elExpense = document.getElementById('dashTotalExpense');
    const elAvailable = document.getElementById('dashAvailable');

    if (elBalance) elBalance.textContent = formatCurrency(totalBalance);
    if (elBudgeted) elBudgeted.textContent = formatCurrency(budgetedMonth);
    if (elIncome) elIncome.textContent = formatCurrency(totalIncomeMonth);
    if (elExpense) elExpense.textContent = formatCurrency(totalExpenseMonth);
    if (elAvailable) {
        elAvailable.textContent = formatCurrency(available);
        elAvailable.classList.toggle('text-danger', available < 0);
        elAvailable.classList.toggle('text-info', available >= 0);
    }
}

// --- TARJETA: CARTERAS Y CUENTAS ---
export function renderDashboardWallets() {
    const container = document.getElementById('dashboard-wallets-list');
    const headerNewTransactionBtn = document.getElementById('headerNewTransactionBtn');

    if (headerNewTransactionBtn) {
        headerNewTransactionBtn.style.display = initial.userWallets.length === 0 ? 'none' : '';
    }

    if (!container) return;

    const walletsToShow = initial.userWallets.filter(w => w.affectsBalance);

    if (walletsToShow.length === 0) {
        container.innerHTML = `<p class="text-muted text-center py-4 mb-0">No tienes carteras que afecten tu balance.</p>`;
        setupScrollFade('dashboard-wallets-list');
        return;
    }

    let html = '';
    walletsToShow.forEach(wallet => {
        const formattedBalance = (wallet.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const balanceColorClass = wallet.balance <= 0 ? 'text-danger' : '';
        html += `
            <div class="d-flex justify-content-between align-items-center mb-2 p-3 rounded" style="background: var(--input-bg); border: 1px solid var(--glass-border);">
                <div class="d-flex align-items-center">
                    <div class="bg-primary text-white rounded p-2 me-3"><i class="${wallet.icon}"></i></div>
                    <p class="mb-0 fw-medium">${wallet.title}</p>
                </div>
                <h5 class="mb-0 fw-bold ${balanceColorClass}">$${formattedBalance}</h5>
            </div>`;
    });

    container.innerHTML = html;
    setupScrollFade('dashboard-wallets-list');
}

// --- TARJETA: METAS FINANCIERAS ---
export function renderDashboardGoals() {
    const container = document.getElementById('dashboard-goals-list');
    if (!container) return;

    if (initial.userGoals.length === 0) {
        container.innerHTML = `<p class="text-muted text-center py-4 mb-0">Aún no hay metas registradas.</p>`;
        setupScrollFade('dashboard-goals-list');
        return;
    }

    let html = '';
    initial.userGoals.forEach(goal => {
        let percent = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        if (percent > 100) percent = 100;

        const colorClass = percent <= 25 ? 'text-danger' : percent <= 50 ? 'text-warning' : percent <= 75 ? 'text-success-light' : 'text-success-dark';
        const barClass = percent <= 25 ? 'bg-gradient-danger' : percent <= 50 ? 'bg-gradient-warning' : percent <= 75 ? 'bg-gradient-success-light' : 'bg-gradient-success-dark';

        const formattedCurrent = (goal.current || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
        const formattedTarget = (goal.target || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

        html += `
            <div class="mb-4">
                <div class="d-flex justify-content-between mb-2"><span class="fw-medium">${goal.title}</span> <span class="fw-bold ${colorClass}">${percent.toFixed(0)}%</span></div>
                <div class="progress" style="height: 8px; border-radius: 10px; background: var(--input-bg);">
                    <div class="progress-bar ${barClass}" style="width: ${percent}%; border-radius: 10px;"></div>
                </div>
                <small class="text-muted mt-1 d-block">$${formattedCurrent} de $${formattedTarget}</small>
            </div>`;
    });

    container.innerHTML = html;
    setupScrollFade('dashboard-goals-list');
}

// --- TARJETA: ÚLTIMOS MOVIMIENTOS (DE TODAS LAS CARTERAS) ---
export function renderDashboardMovements() {
    const container = document.getElementById('dashboard-movements-list');
    if (!container) return;

    let allMovements = [];
    initial.userWallets.forEach(wallet => {
        (wallet.movements || []).forEach(mov => {
            allMovements.push({ ...mov, __walletTitle: wallet.title });
        });
    });

    if (allMovements.length === 0) {
        container.innerHTML = `<p class="text-muted text-center py-4 mb-0">Aún no hay movimientos registrados.</p>`;
        setupScrollFade('dashboard-movements-list');
        return;
    }

    allMovements.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const recent = allMovements.slice(0, 5);

    let html = '';
    recent.forEach(mov => {
        const isIncome = mov.type === 'Ingreso';
        const catObj = initial.sysCategories.find(c => c.id == mov.category);
        const catIconClass = catObj ? catObj.iconId : 'fas fa-tag';
        const catDesc = catObj ? catObj.desc : (mov.category || 'General');
        const amountColor = isIncome ? 'text-success' : 'text-danger';
        const bgColor = isIncome ? 'bg-success' : 'bg-danger';
        const amountPrefix = isIncome ? '+' : '-';

        html += `
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary pb-3" style="border-opacity: 0.2;">
                <div class="d-flex align-items-center">
                    <div class="rounded ${bgColor} bg-opacity-10 ${amountColor} p-2 me-3 d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;"><i class="${catIconClass}"></i></div>
                    <div><p class="mb-0 fw-medium">${catDesc}</p><small class="text-muted">${mov.__walletTitle}</small></div>
                </div>
                <span class="${amountColor} fw-bold">${amountPrefix}$${(mov.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>`;
    });

    container.innerHTML = html;
    setupScrollFade('dashboard-movements-list');
}

// Refresca todo el Dashboard de una sola vez
export function renderDashboard() {
    renderDashboardSummary();
    renderDashboardWallets();
    renderDashboardGoals();
    renderDashboardMovements();
    renderBarChart();
    renderDoughnutChart();
}