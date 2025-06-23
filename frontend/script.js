// Configuração da API
const API_BASE_URL = 'https://localhost:7075/api/sala';

// Elementos do DOM
const salaForm = document.getElementById('sala-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const refreshBtn = document.getElementById('refresh-btn');
const salasList = document.getElementById('salas-list');
const loading = document.getElementById('loading');
const error = document.getElementById('error');

// Estado da aplicação
let isEditing = false;
let editingId = null;

// Mapeamento dos setores
const setores = {
    0: 'CTM',
    1: 'Financeiro',
    2: 'Inova',
    3: 'Segurança_e_Meio_Ambiente',
    4: 'GG',
    5: 'GP'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadSalas();
    setupEventListeners();
});

// Configuração dos event listeners
function setupEventListeners() {
    salaForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', cancelEdit);
    refreshBtn.addEventListener('click', loadSalas);
}

// Função para carregar todas as salas
async function loadSalas() {
    try {
        showLoading(true);
        showError('');
        
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const salas = await response.json();
        renderSalas(salas);
    } catch (err) {
        showError(`Erro ao carregar salas: ${err.message}`);
        console.error('Erro ao carregar salas:', err);
    } finally {
        showLoading(false);
    }
}

// Função para renderizar a lista de salas
function renderSalas(salas) {
    if (salas.length === 0) {
        salasList.innerHTML = `
            <div class="empty-state">
                <h3>Nenhuma sala encontrada</h3>
                <p>Crie uma nova sala para começar!</p>
            </div>
        `;
        return;
    }
    
    salasList.innerHTML = salas.map(sala => createSalaCard(sala)).join('');
}

// Função para criar o HTML de um card de sala
function createSalaCard(sala) {
    const setorNome = setores[sala.setor] || 'Desconhecido';
    
    return `
        <div class="sala-card">
            <div class="sala-header">
                <h3 class="sala-title">${sala.nome}</h3>
                <span class="sala-id">ID: ${sala.id}</span>
            </div>
            
            <div class="sala-info">
                <div class="info-item">
                    <span class="info-label">Número de Lugares:</span>
                    <span class="info-value">${sala.numeroDeLugares}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Setor:</span>
                    <span class="info-value">${setorNome}</span>
                </div>
                ${sala.descricao ? `
                <div class="info-item">
                    <span class="info-label">Descrição:</span>
                    <span class="info-value">${sala.descricao}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="sala-actions">
                <button class="btn-edit" onclick="editSala('${sala.id}')">✏️ Editar</button>
                <button class="btn-delete" onclick="deleteSala('${sala.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Função para lidar com o envio do formulário
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(salaForm);
    const numeroLugares = parseInt(formData.get('numeroLugares'));
    const setor = parseInt(formData.get('setor'));
    
    // Validações
    if (isNaN(numeroLugares) || numeroLugares <= 0) {
        showError('Número de lugares deve ser um número válido maior que 0');
        return;
    }
    
    if (isNaN(setor) || setor < 0 || setor > 5) {
        showError('Selecione um setor válido');
        return;
    }
    
    const salaData = {
        id: formData.get('id'),
        nome: formData.get('nome'),
        numeroDeLugares: numeroLugares,
        setor: setor,
        descricao: formData.get('descricao') || null,
        ativa: true
    };
    
    console.log('Dados da sala a serem enviados:', salaData);
    
    try {
        if (isEditing) {
            await updateSala(salaData);
        } else {
            await createSala(salaData);
        }
        
        resetForm();
        loadSalas();
    } catch (err) {
        showError(`Erro ao ${isEditing ? 'atualizar' : 'criar'} sala: ${err.message}`);
        console.error('Erro no formulário:', err);
    }
}

// Função para criar uma nova sala
async function createSala(salaData) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    showSuccess('Sala criada com sucesso!');
}

// Função para atualizar uma sala existente
async function updateSala(salaData) {
    const response = await fetch(`${API_BASE_URL}/${salaData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    showSuccess('Sala atualizada com sucesso!');
}

// Função para editar uma sala
async function editSala(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const sala = await response.json();
        populateForm(sala);
        setEditMode(true, id);
    } catch (err) {
        showError(`Erro ao carregar sala para edição: ${err.message}`);
        console.error('Erro ao editar sala:', err);
    }
}

// Função para deletar uma sala
async function deleteSala(id) {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        showSuccess('Sala excluída com sucesso!');
        loadSalas();
    } catch (err) {
        showError(`Erro ao excluir sala: ${err.message}`);
        console.error('Erro ao deletar sala:', err);
    }
}

// Função para preencher o formulário com dados da sala
function populateForm(sala) {
    document.getElementById('id').value = sala.id;
    document.getElementById('nome').value = sala.nome;
    document.getElementById('numeroLugares').value = sala.numeroDeLugares;
    document.getElementById('setor').value = sala.setor;
    
    // O campo horarioDisponivel foi removido do modelo, então não precisamos mais preenchê-lo
    // Se você quiser adicionar um campo descrição, pode fazer assim:
    if (sala.descricao) {
        document.getElementById('descricao').value = sala.descricao;
    }
}

// Função para definir modo de edição
function setEditMode(editing, id = null) {
    isEditing = editing;
    editingId = id;
    
    if (editing) {
        formTitle.textContent = 'Editar Sala';
        submitBtn.textContent = 'Atualizar Sala';
        cancelBtn.style.display = 'block';
        document.getElementById('id').readOnly = true;
    } else {
        formTitle.textContent = 'Nova Sala';
        submitBtn.textContent = 'Criar Sala';
        cancelBtn.style.display = 'none';
        document.getElementById('id').readOnly = false;
    }
}

// Função para cancelar edição
function cancelEdit() {
    resetForm();
    setEditMode(false);
}

// Função para resetar o formulário
function resetForm() {
    salaForm.reset();
    setEditMode(false);
}

// Função para mostrar/esconder loading
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
    if (show) {
        salasList.style.display = 'none';
    } else {
        salasList.style.display = 'grid';
    }
}

// Função para mostrar erro
function showError(message) {
    error.textContent = message;
    error.style.display = message ? 'block' : 'none';
}

// Função para mostrar sucesso
function showSuccess(message) {
    // Criar uma notificação temporária
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
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Adicionar estilos CSS para animações
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