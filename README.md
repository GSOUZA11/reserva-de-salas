# 🏢 Reserva de Salas

Sistema web fullstack para gerenciamento de salas e reservas, com controle de conflito de horários.

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Banco de dados**: SQLite (via better-sqlite3)

## ✅ Funcionalidades

### Salas
- Cadastrar, editar, listar e excluir salas
- Cada sala possui: nome, capacidade e descrição (opcional)

### Reservas
- Criar, listar e cancelar reservas
- Cada reserva possui: responsável, sala, data, hora inicial e hora final
- Filtro por texto e por data

### Regras de Negócio
- Não é permitido reservar uma sala em horário já ocupado
- A hora final deve ser maior que a hora inicial
- Mensagem de erro amigável quando houver conflito de horário

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/GSOUZA11/reserva-de-salas.git

# 2. Acesse a pasta
cd reserva-de-salas

# 3. Instale as dependências
npm install

# 4. Inicie o servidor
node server.js
```

Acesse em: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
reserva-de-salas/
├── server.js           # Servidor Express principal
├── database.js         # Configuração e criação do banco SQLite
├── routes/
│   ├── rooms.js        # Rotas CRUD de salas
│   └── bookings.js     # Rotas CRUD de reservas
├── public/
│   ├── index.html      # Interface da aplicação
│   ├── style.css       # Estilos
│   └── app.js          # Lógica do frontend
└── package.json
```

## 🔌 Endpoints da API

### Salas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/rooms | Lista todas as salas |
| GET | /api/rooms/:id | Busca uma sala |
| POST | /api/rooms | Cria uma sala |
| PUT | /api/rooms/:id | Edita uma sala |
| DELETE | /api/rooms/:id | Exclui uma sala |

### Reservas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/bookings | Lista todas as reservas |
| POST | /api/bookings | Cria uma reserva |
| DELETE | /api/bookings/:id | Cancela uma reserva |