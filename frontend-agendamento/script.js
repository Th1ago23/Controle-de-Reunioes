// Configuração da API
const API_BASE_URL = 'https://localhost:7075/api';
const SALAS_API = `${API_BASE_URL}/sala`;
const RESERVAS_API = `${API_BASE_URL}/reserva`;

// Elementos do DOM
const salaSelect = document.getElementById('sala-select');
const dataSelect = document.getElementById('data-select');
const checkAvailabilityBtn = document.getElementById('check-availability-btn');
const availabilitySection = document.getElementById('availability-section');
const availabilityContent = document.getElementById('availability-content');
const closeAvailabilityBtn = document.getElementById('close-availability');
const reservationSection = document.getElementById('reservation-section');
const reservationForm = document.getElementById('reservation-form');
const closeReservationBtn = document.getElementById('close-reservation');
const cancelReservationBtn = document.getElementById('cancel-reservation');
const refreshReservationsBtn = document.getElementById('refresh-reservations');
const reservationsList = document.getElementById('reservations-list');
const loadingReservations = document.getElementById('loading-reservations');
const errorReservations = document.getElementById('error-reservations');
const confirmationModal = document.getElementById('confirmation-modal');
const confirmationDetails = document.getElementById('confirmation-details');
const confirmReservationBtn = document.getElementById('confirm-reservation');
const cancelConfirmationBtn = document.getElementById('cancel-confirmation');

// Estado da aplicação
let selectedSala = null;
let selectedDate = null;
let availableTimeSlots = [];
let currentReservation = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSalas();
    loadReservations();
    setMinDate();
});

// Configuração dos event listeners
function setupEventListeners() {
    checkAvailabilityBtn.addEventListener('click', checkAvailability);
    closeAvailabilityBtn.addEventListener('click', () => hideSection(availabilitySection));
    closeReservationBtn.addEventListener('click', () => hideSection(reservationSection));
    cancelReservationBtn.addEventListener('click', () => hideSection(reservationSection));
    refreshReservationsBtn.addEventListener('click', loadReservations);
    reservationForm.addEventListener('submit', handleReservationSubmit);
    confirmReservationBtn.addEventListener('click', confirmReservation);
    cancelConfirmationBtn.addEventListener('click', hideModal);
    
    // Event listeners para cálculo automático do horário de fim
    document.getElementById('hora-inicio').addEventListener('change', calculateEndTime);
    document.getElementById('duracao').addEventListener('change', calculateEndTime);
}

// Definir data mínima (hoje)
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    dataSelect.min = today;
    dataSelect.value = today;
}

// Carregar salas
async function loadSalas() {
    try {
        const response = await fetch(SALAS_API);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        
        const salas = await response.json();
        populateSalaSelect(salas);
    } catch (error) {
        console.error('Erro ao carregar salas:', error);
        showError('Erro ao carregar salas');
    }
}

// Popular select de salas
function populateSalaSelect(salas) {
    salaSelect.innerHTML = '<option value="">Selecione uma sala</option>';
    
    salas.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = `${sala.nome} (${sala.setor})`;
        salaSelect.appendChild(option);
    });
}

// Verificar disponibilidade
async function checkAvailability() {
    const salaId = salaSelect.value;
    const data = dataSelect.value;
    
    if (!salaId || !data) {
        showError('Selecione uma sala e uma data');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${RESERVAS_API}/disponibilidade/${salaId}?data=${data}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        const disponibilidade = await response.json();
        selectedSala = salaId;
        selectedDate = data;
        availableTimeSlots = disponibilidade.horariosDisponiveis;
        
        renderAvailability(disponibilidade);
        showSection(availabilitySection);
    } catch (error) {
        console.error('Erro ao verificar disponibilidade:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Renderizar disponibilidade
function renderAvailability(disponibilidade) {
    const title = document.getElementById('availability-title');
    title.textContent = `Disponibilidade - ${disponibilidade.sala} (${disponibilidade.data})`;
    
    const grid = document.createElement('div');
    grid.className = 'availability-grid';
    
    disponibilidade.horariosDisponiveis.forEach(horario => {
        const slot = document.createElement('div');
        slot.className = `time-slot ${horario.disponivel ? 'available' : 'unavailable'}`;
        
        slot.innerHTML = `
            <div>${horario.inicio} - ${horario.fim}</div>
            ${horario.disponivel ? 
                '<div class="time-slot-info">Disponível</div>' : 
                `<div class="time-slot-info">Reservado por: ${horario.reservadoPor}</div>`
            }
        `;
        
        if (horario.disponivel) {
            slot.addEventListener('click', () => selectTimeSlot(horario));
        }
        
        grid.appendChild(slot);
    });
    
    availabilityContent.innerHTML = '';
    availabilityContent.appendChild(grid);
}

// Selecionar horário
function selectTimeSlot(horario) {
    // Limpar seleções anteriores
    document.querySelectorAll('.time-slot.selected').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Adicionar seleção
    event.target.closest('.time-slot').classList.add('selected');
    
    showReservationForm(horario);
}

// Mostrar formulário de reserva
function showReservationForm(selectedSlot) {
    const sala = salaSelect.options[salaSelect.selectedIndex].text;
    const data = new Date(selectedDate).toLocaleDateString('pt-BR');
    
    document.getElementById('sala-info').value = sala;
    document.getElementById('data-info').value = data;
    
    populateTimeSelects();
    
    // Definir o horário de início selecionado
    const horaInicio = document.getElementById('hora-inicio');
    horaInicio.value = selectedSlot.inicio;
    
    // Calcular horário de fim
    calculateEndTime();
    
    showSection(reservationSection);
    hideSection(availabilitySection);
}

// Popular selects de horário
function populateTimeSelects() {
    const horaInicio = document.getElementById('hora-inicio');
    
    // Limpar opções
    horaInicio.innerHTML = '<option value="">Selecione</option>';
    
    // Adicionar horários disponíveis (apenas horários de início)
    const horariosInicio = [];
    availableTimeSlots.forEach(slot => {
        if (slot.disponivel && !horariosInicio.includes(slot.inicio)) {
            horariosInicio.push(slot.inicio);
        }
    });
    
    horariosInicio.sort().forEach(horario => {
        const option = document.createElement('option');
        option.value = horario;
        option.textContent = horario;
        horaInicio.appendChild(option);
    });
}

// Calcular horário de fim automaticamente
function calculateEndTime() {
    const horaInicio = document.getElementById('hora-inicio').value;
    const duracao = document.getElementById('duracao').value;
    const horaFim = document.getElementById('hora-fim');
    
    if (horaInicio && duracao) {
        const [hora, minuto] = horaInicio.split(':').map(Number);
        const inicio = new Date();
        inicio.setHours(hora, minuto, 0, 0);
        
        const fim = new Date(inicio.getTime() + (parseInt(duracao) * 60 * 1000));
        const horaFimFormatada = fim.toTimeString().slice(0, 5);
        
        horaFim.value = horaFimFormatada;
        
        // Verificar se o horário de fim está dentro do período de funcionamento
        const funcionamentoFim = '17:15';
        if (horaFimFormatada > funcionamentoFim) {
            horaFim.style.color = '#e53e3e';
            horaFim.style.fontWeight = 'bold';
        } else {
            horaFim.style.color = '#2d3748';
            horaFim.style.fontWeight = 'normal';
        }
    } else {
        horaFim.value = '';
    }
}

// Lidar com envio do formulário
function handleReservationSubmit(event) {
    event.preventDefault();
    
    const horaInicio = document.getElementById('hora-inicio').value;
    const duracao = document.getElementById('duracao').value;
    const horaFim = document.getElementById('hora-fim').value;
    const responsavel = document.getElementById('responsavel').value;
    const gerencia = document.getElementById('gerencia').value;
    const assunto = document.getElementById('assunto').value;
    const observacoes = document.getElementById('observacoes').value;
    
    console.log('Valores do formulário:', {
        horaInicio,
        duracao,
        horaFim,
        responsavel,
        gerencia
    });
    
    if (!horaInicio || !duracao) {
        showError('Selecione o horário de início e a duração');
        return;
    }
    
    if (!responsavel || !gerencia) {
        showError('Preencha o responsável e a gerência');
        return;
    }
    
    // Verificar se o horário de fim está dentro do período de funcionamento
    if (horaFim > '17:15') {
        showError('A reunião não pode terminar após 17:15');
        return;
    }
    
    // Criar objeto de reserva
    const dataInicio = new Date(selectedDate + 'T' + horaInicio);
    const dataFim = new Date(selectedDate + 'T' + horaFim);
    
    currentReservation = {
        salaId: selectedSala,
        responsavel: responsavel,
        gerencia: gerencia,
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString(),
        assunto: assunto || '',
        observacoes: observacoes || ''
    };
    
    console.log('Reserva a ser criada:', currentReservation);
    
    showConfirmationModal();
}

// Mostrar modal de confirmação
function showConfirmationModal() {
    const sala = salaSelect.options[salaSelect.selectedIndex].text;
    const data = new Date(selectedDate).toLocaleDateString('pt-BR');
    const horaInicio = document.getElementById('hora-inicio').value;
    const horaFim = document.getElementById('hora-fim').value;
    const duracao = document.getElementById('duracao');
    const duracaoText = duracao.options[duracao.selectedIndex].text;
    const responsavel = document.getElementById('responsavel').value;
    const gerencia = document.getElementById('gerencia').value;
    const assunto = document.getElementById('assunto').value;
    
    confirmationDetails.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong>Sala:</strong> ${sala}<br>
            <strong>Data:</strong> ${data}<br>
            <strong>Horário:</strong> ${horaInicio} - ${horaFim}<br>
            <strong>Duração:</strong> ${duracaoText}<br>
            <strong>Responsável:</strong> ${responsavel}<br>
            <strong>Gerência:</strong> ${gerencia}
            ${assunto ? `<br><strong>Assunto:</strong> ${assunto}` : ''}
        </div>
    `;
    
    confirmationModal.style.display = 'flex';
}

// Confirmar reserva
async function confirmReservation() {
    try {
        const response = await fetch(RESERVAS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentReservation)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        const reserva = await response.json();
        showSuccess('Reserva criada com sucesso!');
        
        hideModal();
        hideSection(reservationSection);
        reservationForm.reset();
        availableTimeSlots = [];
        currentReservation = null;
        
        loadReservations();
    } catch (error) {
        console.error('Erro ao criar reserva:', error);
        showError(error.message);
    }
}

// Carregar reservas
async function loadReservations() {
    try {
        showLoadingReservations(true);
        showErrorReservations('');
        
        console.log('Fazendo requisição para:', RESERVAS_API);
        const response = await fetch(RESERVAS_API);
        
        console.log('Status da resposta:', response.status);
        console.log('Headers da resposta:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }
        
        const reservas = await response.json();
        console.log('Reservas carregadas:', reservas);
        renderReservations(reservas);
    } catch (error) {
        console.error('Erro ao carregar reservas:', error);
        showErrorReservations(`Erro ao carregar reservas: ${error.message}`);
    } finally {
        showLoadingReservations(false);
    }
}

// Renderizar reservas
function renderReservations(reservas) {
    if (reservas.length === 0) {
        reservationsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #718096;">
                <h3>Nenhuma reserva encontrada</h3>
                <p>Faça sua primeira reserva!</p>
            </div>
        `;
        return;
    }
    
    reservationsList.innerHTML = reservas.map(reserva => createReservationCard(reserva)).join('');
}

// Criar card de reserva
function createReservationCard(reserva) {
    const dataInicio = new Date(reserva.dataInicio);
    const dataFim = new Date(reserva.dataFim);
    const dataFormatada = dataInicio.toLocaleDateString('pt-BR');
    const horaInicio = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const horaFim = dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Calcular duração
    const duracaoMs = dataFim - dataInicio;
    const duracaoMin = Math.round(duracaoMs / (1000 * 60));
    const duracaoText = formatDuration(duracaoMin);
    
    return `
        <div class="reservation-item">
            <div class="reservation-header-info">
                <div class="reservation-title">${reserva.salaNome}</div>
                <span class="reservation-status">Confirmada</span>
            </div>
            
            <div class="reservation-details">
                <div class="detail-item">
                    <span class="detail-label">Data:</span>
                    <span class="detail-value">${dataFormatada}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Horário:</span>
                    <span class="detail-value">${horaInicio} - ${horaFim}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Duração:</span>
                    <span class="detail-value">${duracaoText}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Responsável:</span>
                    <span class="detail-value">${reserva.responsavel}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Gerência:</span>
                    <span class="detail-value">${reserva.gerencia}</span>
                </div>
                ${reserva.assunto ? `
                <div class="detail-item">
                    <span class="detail-label">Assunto:</span>
                    <span class="detail-value">${reserva.assunto}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="reservation-actions">
                <button class="btn-cancel-reservation" onclick="cancelReservation(${reserva.id})">
                    🗑️ Cancelar Reserva
                </button>
            </div>
        </div>
    `;
}

// Formatar duração
function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} minutos`;
    } else if (minutes === 60) {
        return '1 hora';
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) {
            return `${hours} horas`;
        } else {
            return `${hours} hora${hours > 1 ? 's' : ''} e ${remainingMinutes} minutos`;
        }
    }
}

// Cancelar reserva
async function cancelReservation(id) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
        return;
    }
    
    try {
        const response = await fetch(`${RESERVAS_API}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        showSuccess('Reserva cancelada com sucesso!');
        loadReservations();
    } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        showError(error.message);
    }
}

// Funções auxiliares
function showSection(section) {
    section.style.display = 'block';
}

function hideSection(section) {
    section.style.display = 'none';
}

function hideModal() {
    confirmationModal.style.display = 'none';
}

function showLoading(show) {
    checkAvailabilityBtn.disabled = show;
    checkAvailabilityBtn.textContent = show ? 'Carregando...' : '🔍 Verificar Disponibilidade';
}

function showLoadingReservations(show) {
    loadingReservations.style.display = show ? 'block' : 'none';
    if (show) {
        reservationsList.style.display = 'none';
    } else {
        reservationsList.style.display = 'grid';
    }
}

function showError(message) {
    // Criar notificação temporária
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
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
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
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
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showErrorReservations(message) {
    errorReservations.textContent = message;
    errorReservations.style.display = message ? 'block' : 'none';
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