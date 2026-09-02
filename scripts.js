// Variable global para almacenar las instancias de Chart.js y redimensionarlas
window.myBarChart = null;
window.myDoughnutChart = null;

document.addEventListener('DOMContentLoaded', () => {
    // Sincronizar el interruptor de modo oscuro al cargar la página
    const themeSwitch = document.getElementById('darkModeSwitch');
    if (themeSwitch) {
        themeSwitch.checked = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    }

    // Inicializar gráficos si los elementos existen
    initCharts();
});

// Función de Navegación Principal
function navigate(viewId, element) {
    // 1. Validar si el ítem ya está activo
    if (element && element.classList.contains('active-link')) {
        // Haz scroll hacia el top suavemente y aborta el resto de la función
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // 2. Remover estado activo de todos los enlaces
    document.querySelectorAll('.nav-item-custom').forEach(el => {
        el.classList.remove('active-link');
    });

    // Añadir estado activo al enlace clickeado
    if (element) {
        element.classList.add('active-link');
    }

    // 3. Ocultar todas las vistas
    document.querySelectorAll('.app-view').forEach(view => {
        view.classList.remove('active');
    });

    // Mostrar la vista objetivo
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Subir al top instantáneamente al cambiar a una nueva vista
    window.scrollTo({ top: 0, behavior: 'instant' });
}

// Colapsar Sidebar en Desktop
function toggleDesktopSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    
    // Dar tiempo a la transición CSS antes de redimensionar los gráficos
    setTimeout(() => {
        if(window.myBarChart) window.myBarChart.resize();
        if(window.myDoughnutChart) window.myDoughnutChart.resize();
    }, 400); 
}

// Intercambiar Tema (Claro / Oscuro)
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-bs-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    html.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('finanzaspro_theme', newTheme);

    // Actualizar colores de los gráficos si es necesario
    initCharts();
}

// Cerrar Sesión
function logout() {
    // Aquí puedes agregar limpieza de localStorage o sessionStorage si manejas tokens
    window.location.href = 'login.html';
}

function navigateAuth(viewId) {
    document.querySelectorAll('.app-view').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
}

function simulateRegistration() {
    const splash = document.getElementById('splash');
    if(splash) splash.style.display = 'flex';
    setTimeout(() => {
        if(splash) splash.style.display = 'none';
        navigateAuth('verificacion');
        startTimer();
    }, 2000);
}

function login() {
    // Redirige al panel del dashboard completo
    window.location.href = 'dashboard.html';
}

// Inicialización de Gráficos (Dashboard)
function initCharts() {
    const barCanvas = document.getElementById('barChart');
    const doughnutCanvas = document.getElementById('doughnutChart');
    
    if (!barCanvas || !doughnutCanvas) return;

    // Obtener los colores del tema actual basados en variables CSS de Bootstrap
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // Destruir gráficos previos si existen para re-renderizarlos limpios
    if (window.myBarChart) window.myBarChart.destroy();
    if (window.myDoughnutChart) window.myDoughnutChart.destroy();

    // Gráfico de Barras
    const ctxBar = barCanvas.getContext('2d');
    window.myBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [12000, 19000, 15000, 22000, 18000, 25000],
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                },
                {
                    label: 'Gastos',
                    data: [8000, 11000, 9500, 14000, 12000, 15000],
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: gridColor }, ticks: { color: textColor } },
                x: { grid: { display: false }, ticks: { color: textColor } }
            },
            plugins: {
                legend: { labels: { color: textColor } }
            }
        }
    });

    // Gráfico de Dona
    const ctxDoughnut = doughnutCanvas.getContext('2d');
    window.myDoughnutChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Ahorros', 'Inversión', 'Gastos Fijos', 'Ocio'],
            datasets: [{
                data: [35, 25, 30, 10],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, padding: 20 } }
            }
        }
    });
}