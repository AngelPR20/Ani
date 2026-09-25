import * as initial from './initial.js';

export function renderMantCategories() {
    const tbody = document.getElementById('table-mant-cats');
    if (!tbody) return;

    if (initial.sysCategories.length === 0) {
        tbody.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-tags fa-4x text-muted mb-3 opacity-25"></i>
            <h5 class="fw-bold text-muted mb-2">Aún no hay categorías registradas</h5>
            <p class="text-muted">¡Anímate a crear la primera para organizar tus finanzas!</p>
        </div>`;
        return;
    }

    let html = '';

    initial.sysCategories.map(cat => 
        html += `
            <div class="col-md-4 col-xl-3">
                <div class="p-2 border rounded text-center position-relative" style="border-color: var(--glass-border) !important; background: var(--input-bg);">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center">
                            <div class="bg-secondary bg-opacity-10 text-primary rounded px-2 me-2 fss-4">
                                <i class="${cat.iconId}"></i>
                            </div>
                            <h6 class="fw-medium mb-0 me-2 badge bg-primary bg-opacity-75">${cat.desc}</h6>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-link text-muted px-2 py-1" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-v"></i></button>
                            <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                <li><button class="dropdown-item py-2 btnEditCategory" data-id=${cat.id}><i class="fas fa-edit me-2 text-primary"></i>Editar</button></li>
                                <li><button class="dropdown-item py-2 text-danger btnDeleteCategory" data-id=${cat.id}><i class="fas fa-trash-alt me-2"></i>Eliminar</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`
    );

    tbody.innerHTML = html;

    tbody.querySelectorAll('.btnEditCategory').forEach(btnEditCategory => {
        btnEditCategory.addEventListener('click', () => {
            editCategory(btnEditCategory.getAttribute('data-id'));
        });
    });
    tbody.querySelectorAll('.btnDeleteCategory').forEach(btnDeleteCategory => {
        btnDeleteCategory.addEventListener('click', () => {
            deleteCategory(btnDeleteCategory.getAttribute('data-id'));
        });
    });
}

export function openAddCategoryModal() {
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryDesc').value = '';
    document.getElementById('categoryModalTitle').textContent = 'Nueva Categoría';
}

export function editCategory(id) {
    console.log(initial.sysCategories);
    console.log(id);
    console.log(initial.sysCategories.find(x => x.id == id));


    const c = initial.sysCategories.find(x => x.id == id);
    if (!c) return;

    document.getElementById('categoryId').value = c.id;
    document.getElementById('categoryDesc').value = c.desc;
    document.getElementById('categoryIconId').value = initial.sysIcons.find(i=>i.val == c.iconId)?.val || ''; // Mapping back for UI
    document.getElementById('btn-categoryIconId').innerHTML = `<span><i class="${c.iconId} me-2 text-primary"></i></span> <i class="fas fa-chevron-down"></i>`;
    document.getElementById('categoryModalTitle').textContent = 'Editar Categoría';
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

export function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const desc = document.getElementById('categoryDesc').value.trim();
    const iconClass = document.getElementById('categoryIconId').value;
    
    if(!desc) { showAlertModal('Error', 'La descripción es obligatoria.'); return; }
    const icon = initial.sysIcons.find(i => i.val === iconClass);

    if (id) {
        const idx = initial.sysCategories.findIndex(x => x.id == id);
        initial.sysCategories[idx] = { ...initial.sysCategories[idx], desc, iconId: icon.val };
    } else {
        initial.sysCategories.push({ id: initial.sysCategories.length+1, desc, iconId: icon?.val||'fas fa-tags' });
    }
    renderMantCategories();
    initial.initCustomSelects(); // Actualiza listados en transacciones/presupuestos
    bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
}

export function deleteCategory(id) {
    initial.showConfirmModal('¿Eliminar Categoría?', 'Asegúrate de que no esté en uso.', () => {
        initial.setSysCategories(initial.sysCategories.filter(x => x.id != id));
        renderMantCategories();
        initial.initCustomSelects();
    });
}