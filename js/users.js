import * as initial from '/js/initial.js';

export function renderMantUsers() {
    const tbody = document.getElementById('table-mant-users');
    // const avatarImg = u.avatar ? `<img src="${u.avatar}" class="rounded-circle border" width="35" height="35" style="object-fit:cover;">` : `<div class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style="width:35px; height:35px;">${u.name.charAt(0).toUpperCase()}</div>`;
    if (!tbody) return;
    // <td>${u.avatar ? `<img src="${u.avatar}" class="rounded-circle border" width="35" height="35" style="object-fit:cover;">` : `<div class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center" style="width:35px; height:35px;">${u.name.charAt(0).toUpperCase()}</div>`}
    // </td>

    let html = '';

    initial.sysUsers.map(u => {
        html += `<tr>
            <td class="fw-medium d-flex align-items-center">${u.avatar ? `<img src="${u.avatar}" class="rounded-circle border me-3" width="35" height="35" style="object-fit:cover;">` : `<div class="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center me-3" style="width:35px; height:35px;">${u.name.charAt(0).toUpperCase()}</div>`} ${u.name}</td>
            <td class="text-muted">${u.email}</td>
            <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${u.role}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary p-1 px-2 btnEditUser" data-id=${u.id}><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger p-1 px-2 btnDeleteUser" data-id=${u.id}><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>`;
    });

    console.log(initial.sysUsers);

    tbody.innerHTML = html;

    tbody.querySelectorAll('.btnEditUser').forEach(btnEditUser => {
        btnEditUser.addEventListener('click', () => {
            editUser(btnEditUser.getAttribute('data-id'));
        });
    });
    tbody.querySelectorAll('.btnDeleteUser').forEach(btnDeleteUser => {
        btnDeleteUser.addEventListener('click', () => {
            deleteUser(btnDeleteUser.getAttribute('data-id'));
        });
    });
}

// USUARIOS
export function openAddUserModal() {
    document.getElementById('userId').value = '';
    document.getElementById('userAvatar').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userRole').value = 'Viewer';
    document.getElementById('userModalTitle').textContent = 'Nuevo Usuario';
}

export function editUser(id) {
    const u = initial.sysUsers.find(x => x.id == id);
    if (!u) return;
    document.getElementById('userId').value = u.id;
    document.getElementById('userAvatar').value = u.avatar;
    document.getElementById('userName').value = u.name;
    document.getElementById('userEmail').value = u.email;
    document.getElementById('userRole').value = u.role;
    document.getElementById('userModalTitle').textContent = 'Editar Usuario';
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

export function saveUser() {
    const id = document.getElementById('userId').value;
    const data = {
        avatar: document.getElementById('userAvatar').value.trim(),
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        role: document.getElementById('userRole').value
    };
    if(!data.name || !data.email) { showAlertModal('Error', 'Nombre y Email son requeridos.'); return; }

    if (id) {
        const idx = initial.sysUsers.findIndex(x => x.id == id);
        initial.sysUsers[idx] = { ...initial.sysUsers[idx], ...data };
    } else {
        initial.sysUsers.push({ id: Date.now(), ...data });
    }
    renderMantUsers();
    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
}

export function deleteUser(id) {
    initial.showConfirmModal('¿Eliminar Usuario?', 'El usuario será removido del sistema.', () => {
        initial.setSysUsers(initial.sysUsers.filter(x => x.id != id));
        renderMantUsers();
    });
}