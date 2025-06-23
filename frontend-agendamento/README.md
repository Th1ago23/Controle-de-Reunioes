# Sistema de Agendamento de Salas

Este é o frontend para o sistema de agendamento de salas de reunião.

## 🎯 Funcionalidades

### 📅 Verificação de Disponibilidade
- Selecione uma sala e uma data
- Visualize todos os horários disponíveis (07:30 às 17:15)
- Veja quais horários já estão reservados e por quem

### 📝 Criação de Reservas
- Escolha um horário disponível
- Preencha os dados da reserva:
  - **Responsável**: Nome da pessoa que está fazendo a reserva
  - **Gerência**: Gerência do responsável
  - **Assunto**: Tema da reunião (opcional)
  - **Observações**: Informações adicionais (opcional)

### 📋 Gerenciamento de Reservas
- Visualize todas as suas reservas
- Cancele reservas quando necessário
- Veja detalhes completos de cada reserva

## 🚀 Como Usar

### 1. Iniciar a API
```bash
# Na pasta do projeto .NET
dotnet run
```

### 2. Abrir o Frontend
Abra o arquivo `frontend-agendamento/index.html` no navegador.

### 3. Fazer uma Reserva
1. **Selecione uma sala** no dropdown
2. **Escolha uma data** (apenas dias úteis)
3. **Clique em "Verificar Disponibilidade"**
4. **Clique em um horário disponível** (verde)
5. **Preencha os dados** da reserva
6. **Confirme a reserva**

## 📊 Regras do Sistema

### ⏰ Horário de Funcionamento
- **Segunda a Sexta**: 07:30 às 17:15
- **Fins de semana**: Não é possível fazer reservas

### 🕐 Intervalos de Tempo
- Horários são divididos em intervalos de **30 minutos**
- Exemplo: 07:30-08:00, 08:00-08:30, etc.

### ✅ Validações
- Não é possível reservar horários já ocupados
- Não é possível reservar para datas passadas
- Não é possível reservar fora do horário de funcionamento
- Não é possível reservar para fins de semana

## 🎨 Interface

### Cores dos Horários
- **🟢 Verde**: Horário disponível
- **🔴 Vermelho**: Horário já reservado
- **🔵 Azul**: Horário selecionado

### Estados da Interface
- **Loading**: Indicadores de carregamento
- **Sucesso**: Notificações verdes
- **Erro**: Notificações vermelhas

## 🔧 Configuração

Se a API estiver em uma porta diferente, edite a variável no `script.js`:

```javascript
const API_BASE_URL = 'https://localhost:7075/api';
```

## 📱 Responsividade

O sistema funciona em:
- Desktop
- Tablet
- Mobile

## 🐛 Solução de Problemas

### Erro de CORS
Certifique-se de que o CORS está habilitado na API.

### API não encontrada
- Verifique se a API está rodando
- Confirme a URL no `script.js`

### Dados não carregam
- Abra o Console do navegador (F12)
- Verifique se há erros de rede
- Teste a API diretamente no Swagger

## 🎯 Próximos Passos

Para melhorar o sistema, considere:
- Autenticação de usuários
- Filtros por setor/gerência
- Relatórios de uso
- Notificações por email
- Integração com calendário 