const API = 'http://localhost:3000/api';

let allRooms = [];
let allBookings = [];

// ==================== TABS ====================
function showTab(tab) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  event.target.classList.add('active');
  if (tab === 'reservas') {
    loadBookings();
    populateRoomSelect();
  }
}

// ==================== SALAS ====================
async function loadRooms() {
  document.getElementById('rooms-loading').style.display = 'block';
  document.getElementById('rooms-empty').style.display = 'none';
  document.getElementById('rooms-list').innerHTML = '';

  const res = await fetch(`${API}/rooms`);
  allRooms = await res.json();

  document.getElementById('rooms-loading').style.display = 'none';
  updateRoomStats();
  renderRooms(allRooms);
}

function updateRoomStats() {
  document.getElementById('stat-rooms').textContent = allRooms.length;
  const totalCap = allRooms.reduce((s, r) => s + r.capacity, 0);
  document.getElementById('stat-capacity').textContent = totalCap;
  document.getElementById('rooms-badge').textContent = allRooms.length + ' salas';
}

function renderRooms(rooms) {
  const list = document.getElementById('rooms-list');
  list.innerHTML = '';
  if (rooms.length === 0) {
    document.getElementById('rooms-empty').style.display = 'block';
    return;
  }
  document.getElementById('rooms-empty').style.display = 'none';
  rooms.forEach(r => {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.innerHTML = `
      <div class="room-avatar">🚪</div>
      <div class="room-info">
        <h3>${r.name}</h3>
        ${r.description ? `<p>${r.description}</p>` : ''}
        <span class="room-capacity">👥 ${r.capacity} pessoas</span>
      </div>
      <div class="room-actions">
        <button class="btn btn-edit" onclick="editRoom(${r.id})">✏️ Editar</button>
        <button class="btn btn-cancel" onclick="deleteRoom(${r.id})">🗑️ Excluir</button>
      </div>
    `;
    list.appendChild(card);
  });
}

document.getElementById('room-search').addEventListener('input', function () {
  const q = this.value.toLowerCase();
  renderRooms(allRooms.filter(r =>
    r.name.toLowerCase().includes(q) ||
    (r.description || '').toLowerCase().includes(q)
  ));
});

document.getElementById('room-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('room-id').value;
  const data = {
    name: document.getElementById('room-name').value,
    capacity: parseInt(document.getElementById('room-capacity').value),
    description: document.getElementById('room-description').value,
  };

  if (id) {
    await fetch(`${API}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showToast('✅ Sala atualizada!', 'success');
    resetRoomForm();
  } else {
    await fetch(`${API}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    showToast('✅ Sala cadastrada!', 'success');
  }
  e.target.reset();
  await loadRooms();
});

async function editRoom(id) {
  const res = await fetch(`${API}/rooms/${id}`);
  const r = await res.json();
  document.getElementById('room-id').value = r.id;
  document.getElementById('room-name').value = r.name;
  document.getElementById('room-capacity').value = r.capacity;
  document.getElementById('room-description').value = r.description || '';
  document.getElementById('room-form-title').textContent = 'Editar Sala';
  document.getElementById('room-cancel-btn').style.display = 'inline-flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteRoom(id) {
  if (!confirm('Excluir esta sala? Todas as reservas associadas também serão removidas.')) return;
  await fetch(`${API}/rooms/${id}`, { method: 'DELETE' });
  showToast('🗑️ Sala excluída!', 'error');
  await loadRooms();
}

document.getElementById('room-cancel-btn').addEventListener('click', resetRoomForm);

function resetRoomForm() {
  document.getElementById('room-form').reset();
  document.getElementById('room-id').value = '';
  document.getElementById('room-form-title').textContent = 'Nova Sala';
  document.getElementById('room-cancel-btn').style.display = 'none';
}

// ==================== RESERVAS ====================
async function loadBookings() {
  document.getElementById('bookings-loading').style.display = 'block';
  document.getElementById('bookings-empty').style.display = 'none';
  document.getElementById('bookings-list').innerHTML = '';

  const res = await fetch(`${API}/bookings`);
  allBookings = await res.json();

  document.getElementById('bookings-loading').style.display = 'none';
  updateBookingStats();
  renderBookings(allBookings);
}

function updateBookingStats() {
  document.getElementById('bookings-badge').textContent = allBookings.length + ' reservas';
  const today = new Date().toISOString().split('T')[0];
  const todayCount = allBookings.filter(b => b.date === today).length;
  document.getElementById('stat-today').textContent = todayCount;
}

function renderBookings(bookings) {
  const list = document.getElementById('bookings-list');
  list.innerHTML = '';
  if (bookings.length === 0) {
    document.getElementById('bookings-empty').style.display = 'block';
    return;
  }
  document.getElementById('bookings-empty').style.display = 'none';
  bookings.forEach(b => {
    const card = document.createElement('div');
    card.className = 'booking-card';
    const dateFormatted = new Date(b.date + 'T00:00:00').toLocaleDateString('pt-BR');
    card.innerHTML = `
      <div class="booking-header">
        <span class="booking-responsible">👤 ${b.responsible}</span>
        <span class="booking-room-badge">🚪 ${b.room_name}</span>
      </div>
      <div class="booking-details">
        <span class="booking-detail">📅 ${dateFormatted}</span>
        <span class="booking-detail">🕐 ${b.start_time} → ${b.end_time}</span>
        <span class="booking-detail">👥 Cap. ${b.room_capacity}</span>
      </div>
      <div class="booking-footer">
        <button class="btn btn-cancel" onclick="cancelBooking(${b.id})">❌ Cancelar Reserva</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function applyBookingFilters() {
  const q = document.getElementById('booking-search').value.toLowerCase();
  const dateFilter = document.getElementById('booking-filter-date').value;
  let filtered = allBookings.filter(b => {
    const matchText = b.responsible.toLowerCase().includes(q) || b.room_name.toLowerCase().includes(q);
    const matchDate = dateFilter ? b.date === dateFilter : true;
    return matchText && matchDate;
  });
  renderBookings(filtered);
}

document.getElementById('booking-search').addEventListener('input', applyBookingFilters);
document.getElementById('booking-filter-date').addEventListener('change', applyBookingFilters);

function clearFilters() {
  document.getElementById('booking-search').value = '';
  document.getElementById('booking-filter-date').value = '';
  renderBookings(allBookings);
}

async function populateRoomSelect() {
  const res = await fetch(`${API}/rooms`);
  const rooms = await res.json();
  const select = document.getElementById('booking-room');
  select.innerHTML = '<option value="">Selecione uma sala...</option>';
  rooms.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.id;
    opt.textContent = `${r.name} (${r.capacity} pessoas)`;
    select.appendChild(opt);
  });
}

document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    room_id: parseInt(document.getElementById('booking-room').value),
    responsible: document.getElementById('booking-responsible').value,
    date: document.getElementById('booking-date').value,
    start_time: document.getElementById('booking-start').value,
    end_time: document.getElementById('booking-end').value,
  };

  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    showToast('⚠️ ' + result.error, 'warning');
    return;
  }

  showToast('✅ Reserva criada com sucesso!', 'success');
  e.target.reset();
  await loadBookings();
});

async function cancelBooking(id) {
  if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
  await fetch(`${API}/bookings/${id}`, { method: 'DELETE' });
  showToast('❌ Reserva cancelada!', 'error');
  await loadBookings();
}

// ==================== TOAST ====================
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ==================== INIT ====================
loadRooms();