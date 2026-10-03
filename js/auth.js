// ==========================================
// LÓGICA COMPARTIDA PARA PÁGINAS DE AUTENTICACIÓN
// (login.html, forgot-password.html, reset-password.html)
// ==========================================

// --- Alternar tema claro/oscuro (mismo localStorage que el resto de la app) ---
function initAuthThemeToggle() {
    const btn = document.getElementById('btnToggleAuthTheme');
    const icon = document.getElementById('authThemeIcon');
    if (!btn || !icon) return;

    const applyIcon = (theme) => {
        icon.classList.toggle('fa-moon', theme !== 'dark');
        icon.classList.toggle('fa-sun', theme === 'dark');
    };

    applyIcon(document.documentElement.getAttribute('data-bs-theme') || 'light');

    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', next);
        localStorage.setItem('finanzaspro_theme', next);
        applyIcon(next);
    });
}

// --- Mostrar/ocultar contraseña: aplica a todo botón .password-toggle-btn con data-target ---
function initPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            if (!input) return;

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';
            if (icon) {
                icon.classList.toggle('fa-eye', !isHidden);
                icon.classList.toggle('fa-eye-slash', isHidden);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initAuthThemeToggle();
    initPasswordToggles();
});