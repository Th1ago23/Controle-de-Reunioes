const API_BASE_URL = 'http://localhost:5162/api/sala';

const salaForm = document.getElementById('sala-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const salasList = document.getElementById('salas-list');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

let isEditing = false;
let editingId = null;

const setores = {
    0: 'CTM',
    1: 'Financeiro',
    2: 'Inova',
    3: 'Segurança_e_Meio_Ambiente',
    4: 'GG',
    5: 'GP'
};

document.addEventListener('DOMContentLoaded', () => {
    loadSalas();
    setupEventListeners();
});

function setupEventListeners() {
    salaForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    refreshBtn.addEventListener('click', loadSalas);
}

async function loadSalas() {
    try {
        showLoading(true);
        showError('');
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
        const salas = await response.json();
        renderSalas(salas);
    } catch (err) {
        showError(`Erro ao carregar salas: ${err.message}`);
    } finally {
        showLoading(false);
    }
}

function renderSalas(salas) {
    salasList.innerHTML = salas.length === 0
        ? `<div class="empty-state"><h3>Nenhuma sala encontrada</h3><p>Crie uma nova sala para começar!</p></div>`
        : salas.map(sala => createSalaCard(sala)).join('');
}

function createSalaCard(sala) {
    const setorNome = setores[sala.setor] || 'Desconhecido';
    return `
        <div class="sala-card">
            <div class="sala-header">
                <h3 class="sala-title">${sala.nome}</h3>
                <span class="sala-id">ID: ${sala.id}</span>
            </div>
            <div class="sala-info">
                <div class="info-item"><span class="info-label">Número de Lugares:</span><span class="info-value">${sala.numeroDeLugares}</span></div>
                <div class="info-item"><span class="info-label">Setor:</span><span class="info-value">${setorNome}</span></div>
                ${sala.descricao ? `<div class="info-item"><span class="info-label">Descrição:</span><span class="info-value">${sala.descricao}</span></div>` : ''}
            </div>
            <div class="sala-actions">
                <button class="btn-edit" onclick="editSala('${sala.id}')">✏️ Editar</button>
                <button class="btn-delete" onclick="deleteSala('${sala.id}')">🗑️ Excluir</button>
            </div>
        </div>`;
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(salaForm);
    const numeroDeLugares = parseInt(formData.get('numeroLugares'));
    const setor = parseInt(formData.get('setor'));

    if (isNaN(numeroDeLugares) || numeroDeLugares <= 0) {
        return showError('Número de lugares deve ser maior que 0');
    }

    if (isNaN(setor) || setor < 0 || setor > 5) {
        return showError('Selecione um setor válido');
    }

    const salaData = {
        nome: formData.get('nome'),
        numeroDeLugares,
        setor,
        descricao: formData.get('descricao') || null,
        ativa: true
    };

    try {
        if (isEditing && editingId) {
            salaData.id = editingId;
            await updateSala(salaData);
        } else {
            await createSala(salaData);
        }

        resetForm();
        loadSalas();
    } catch (err) {
        showError(`Erro ao ${isEditing ? 'atualizar' : 'criar'} sala: ${err.message}`);
    }
}

async function createSala(salaData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salaData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    showSuccess('Sala criada com sucesso!');
}

async function updateSala(salaData) {
    const response = await fetch(`${API_BASE_URL}/${salaData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salaData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    showSuccess('Sala atualizada com sucesso!');
}

async function editSala(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
        const sala = await response.json();
        populateForm(sala);
        setEditMode(true, sala.id);
    } catch (err) {
        showError(`Erro ao carregar sala para edição: ${err.message}`);
    }
}

async function deleteSala(id) {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Erro ${response.status}: ${await response.text()}`);
        showSuccess('Sala excluída com sucesso!');
        loadSalas();
    } catch (err) {
        showError(`Erro ao excluir sala: ${err.message}`);
    }
}

function populateForm(sala) {
    document.getElementById('nome').value = sala.nome;
    document.getElementById('numeroLugares').value = sala.numeroDeLugares;
    document.getElementById('setor').value = sala.setor;
    document.getElementById('descricao').value = sala.descricao || '';
}

function setEditMode(editing, id = null) {
    isEditing = editing;
    editingId = id;

    formTitle.textContent = editing ? 'Editar Sala' : 'Nova Sala';
    submitBtn.textContent = editing ? 'Atualizar Sala' : 'Criar Sala';
    cancelBtn.style.display = editing ? 'block' : 'none';
}

function cancelEdit() {
    resetForm();
    setEditMode(false);
}

function resetForm() {
    salaForm.reset();
    editingId = null;
    setEditMode(false);
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    salasList.style.display = show ? 'none' : 'grid';
}

function showError(message) {
    error.textContent = message;
    error.style.display = message ? 'block' : 'none';
}

function showSuccess(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #38a169;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
