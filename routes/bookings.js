const express = require('express');
const router = express.Router();
const db = require('../database');

// GET - Listar todas as reservas (com nome da sala)
router.get('/', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, r.name as room_name, r.capacity as room_capacity
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.date ASC, b.start_time ASC
  `).all();
  res.json(bookings);
});

// GET - Listar reservas de uma sala específica
router.get('/room/:room_id', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, r.name as room_name
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.room_id = ?
    ORDER BY b.date ASC, b.start_time ASC
  `).all(req.params.room_id);
  res.json(bookings);
});

// POST - Criar reserva
router.post('/', (req, res) => {
  const { room_id, responsible, date, start_time, end_time } = req.body;

  // Validação de campos obrigatórios
  if (!room_id || !responsible || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  // Regra: hora final deve ser maior que hora inicial
  if (end_time <= start_time) {
    return res.status(400).json({ error: 'A hora final deve ser maior que a hora inicial' });
  }

  // Regra: verificar conflito de horário na mesma sala e data
  const conflict = db.prepare(`
    SELECT id FROM bookings
    WHERE room_id = ?
      AND date = ?
      AND id != COALESCE(?, -1)
      AND (
        (start_time < ? AND end_time > ?)
      )
  `).get(room_id, date, null, end_time, start_time);

  if (conflict) {
    return res.status(409).json({
      error: 'Conflito de horário! Esta sala já está reservada neste período.'
    });
  }

  const result = db.prepare(
    'INSERT INTO bookings (room_id, responsible, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)'
  ).run(room_id, responsible, date, start_time, end_time);

  const newBooking = db.prepare(`
    SELECT b.*, r.name as room_name
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(newBooking);
});

// DELETE - Cancelar reserva
router.delete('/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Reserva não encontrada' });
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ message: 'Reserva cancelada com sucesso' });
});

module.exports = router;