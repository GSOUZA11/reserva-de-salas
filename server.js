const express = require('express');
const cors = require('cors');
const path = require('path');

require('./database'); // inicializa e cria as tabelas

const roomsRouter = require('./routes/rooms');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});