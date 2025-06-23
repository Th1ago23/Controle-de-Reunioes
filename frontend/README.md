# Frontend para API de Controle de Reuniões

Este é um frontend básico para testar a API de salas do sistema de Controle de Reuniões.

## 📁 Estrutura dos Arquivos

```
frontend/
├── index.html      # Página principal
├── styles.css      # Estilos CSS
├── script.js       # Lógica JavaScript
└── README.md       # Este arquivo
```

## 🚀 Como Usar

### 1. Iniciar a API
Primeiro, certifique-se de que a API está rodando:
```bash
# Na pasta do projeto .NET
dotnet run
```

A API deve estar disponível em: `https://localhost:7075`

### 2. Abrir o Frontend
Abra o arquivo `index.html` em qualquer navegador moderno. Você pode:
- Clicar duas vezes no arquivo
- Arrastar o arquivo para o navegador
- Usar um servidor local (recomendado)

### 3. Servidor Local (Opcional)
Para melhor experiência, você pode usar um servidor local:

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (npx)
npx serve .

# Com PHP
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

## ✨ Funcionalidades

### 📋 Listar Salas
- Carrega automaticamente todas as salas disponíveis
- Botão "Atualizar" para recarregar a lista

### ➕ Criar Nova Sala
- Formulário completo com todos os campos:
  - **ID**: Identificador único da sala
  - **Nome**: Nome da sala
  - **Número de Lugares**: Capacidade da sala
  - **Setor**: Selecione entre os setores disponíveis
  - **Horário Disponível**: Data e hora de disponibilidade

### ✏️ Editar Sala
- Clique no botão "Editar" em qualquer sala
- O formulário será preenchido com os dados atuais
- O ID fica bloqueado para edição
- Clique "Atualizar Sala" para salvar as mudanças

### 🗑️ Excluir Sala
- Clique no botão "Excluir" em qualquer sala
- Confirmação será solicitada antes da exclusão

## 🎨 Interface

- **Design Responsivo**: Funciona em desktop e mobile
- **Feedback Visual**: Notificações de sucesso e erro
- **Loading States**: Indicadores de carregamento
- **Validação**: Campos obrigatórios e validação de dados

## 🔧 Configuração

Se a API estiver rodando em uma porta diferente, edite a variável `API_BASE_URL` no arquivo `script.js`:

```javascript
const API_BASE_URL = 'https://localhost:7075/api/sala';
```

## 🐛 Solução de Problemas

### Erro de CORS
Se você encontrar erros de CORS, certifique-se de que a API está configurada para permitir requisições do frontend.

### API não encontrada
- Verifique se a API está rodando
- Confirme a URL e porta no `script.js`
- Verifique se não há firewall bloqueando

### Dados não carregam
- Abra o Console do navegador (F12) para ver erros
- Verifique se a API está retornando dados válidos
- Teste a API diretamente no Swagger UI

## 📱 Compatibilidade

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🎯 Próximos Passos

Este é um frontend básico para testes. Para produção, considere:

- Adicionar autenticação
- Implementar paginação
- Adicionar filtros e busca
- Melhorar validações
- Adicionar testes automatizados 