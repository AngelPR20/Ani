
import * as initial from './initial.js';

export function renderMantIcons() {
    const grid = document.getElementById('grid-mant-icons');
    if (!grid) return;
    let html = '';
    
    initial.sysIcons.map(icon => {
        html += `
        <div class="col-4 col-ssm-4 col-md-2 col-lg-2">
            <div class="p-3 border rounded text-center position-relative" style="border-color: var(--glass-border) !important; background: var(--input-bg);">
                <i class="${icon.val} fs-3 text-primary my-3"></i>
            
                <div class="dropdown position-absolute top-0 end-0 m-2">
                    <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                    <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                        <li><button class="dropdown-item py-2 btnEditIcon" data-id=${icon.id}><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                        <li><button class="dropdown-item py-2 text-danger btnDeleteIcon" data-id=${icon.id}><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                    </ul>
                </div>
            </div>
        </div>`;
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.btnEditIcon').forEach(btnEditIcon => {
        btnEditIcon.addEventListener('click', () => {
            editIcon(btnEditIcon.getAttribute('data-id'));
        });
    });
    grid.querySelectorAll('.btnDeleteIcon').forEach(btnDeleteIcon => {
        btnDeleteIcon.addEventListener('click', () => {
            deleteIcon(btnDeleteIcon.getAttribute('data-id'));
        });
    });
}

export function openAddIconModal() {
    document.getElementById('iconId').value = '';
    document.getElementById('iconClass').value = '';
    document.getElementById('iconModalTitle').textContent = 'Nuevo Ícono';
}

export function editIcon(id) {
    const i = initial.sysIcons.find(x => x.id == id);
    if (!i) return;
    document.getElementById('iconId').value = i.id;
    document.getElementById('iconClass').value = i.val;
    document.getElementById('iconModalTitle').textContent = 'Editar Ícono';
    new bootstrap.Modal(document.getElementById('iconModal')).show();
}

export function saveIcon() {
    const id = document.getElementById('iconId').value;
    const classVal = document.getElementById('iconClass').value.trim();
    if(!classVal) { showAlertModal('Error', 'Todos los campos son obligatorios.'); return; }

    if (id) {
        const idx = initial.sysIcons.findIndex(x => x.id == id);
        initial.sysIcons[idx] = { ...initial.sysIcons[idx], val: classVal };
    } else {
        initial.sysIcons.push({ id: initial.sysIcons.length+2, val: classVal });
    }
    renderMantIcons();
    initial.initCustomSelects(); // Actualizar listados
    bootstrap.Modal.getInstance(document.getElementById('iconModal')).hide();
}

export function deleteIcon(id) {
    initial.showConfirmModal('¿Eliminar Ícono?', 'Asegúrate de que no esté en uso.', () => {
        initial.setSysIcons(initial.sysIcons.filter(x => x.id != id));
        renderMantIcons();
        initial.initCustomSelects();
    });
}