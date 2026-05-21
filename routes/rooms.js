const express = require('express');
const router = express.Router();
const db = require('../database');

// GET - Listar todas as salas
router.get('/', (req, res) => {
  const rooms = db.prepare('SELECT * FROM rooms ORDER BY name ASC').all();
  res.json(rooms);
});

// GET - Buscar uma sala
router.get('/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: 'Sala não encontrada' });
  res.json(room);
});

// POST - Criar sala
router.post('/', (req, res) => {
  const { name, capacity, description } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Nome e capacidade são obrigatórios' });
  }
  const result = db.prepare(
    'INSERT INTO rooms (name, capacity, description) VALUES (?, ?, ?)'
  ).run(name, capacity, description || '');
  const newRoom = db.prepare('SELECT * FROM rooms WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newRoom);
});

// PUT - Editar sala
router.put('/:id', (req, res) => {
  const { name, capacity, description } = req.body;
  const exists = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Sala não encontrada' });
  db.prepare(
    'UPDATE rooms SET name=?, capacity=?, description=? WHERE id=?'
  ).run(name, capacity, description || '', req.params.id);
  const updated = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE - Excluir sala
router.delete('/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM rooms WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: 'Sala não encontrada' });
  db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
  res.json({ message: 'Sala excluída com sucesso' });
});

module.exports = router;