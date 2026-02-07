const form = document.getElementById('todo-form');
const titleInput = document.getElementById('title');
const dateInput = document.getElementById('dueDate');
const titleError = document.getElementById('title-error');
const dateError = document.getElementById('date-error');

const todoListEl = document.getElementById('todo-list');
const searchInput = document.getElementById('search');
const filterButtons = document.querySelectorAll('.filter');
const fromDate = document.getElementById('fromDate');
const toDate = document.getElementById('toDate');
const clearAllBtn = document.getElementById('clear-all');
const clearFormBtn = document.getElementById('clear-form');

let todos = [];


const todayISO = () => {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d.toISOString().slice(0,10);
};

const loadTodos = () => {
  const raw = localStorage.getItem('todos');
  todos = raw ? JSON.parse(raw) : [];
};

const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos));
};

const render = () => {
  const q = searchInput.value.trim().toLowerCase();
  const activeFilter = document.querySelector('.filter.active')?.dataset.filter || 'all';
  const from = fromDate.value || null;
  const to = toDate.value || null;

  todoListEl.innerHTML = '';

  const filtered = todos.filter(t => {
    if (q && !t.title.toLowerCase().includes(q)) return false;

    if (from && t.dueDate < from) return false;
    if (to && t.dueDate > to) return false;

    if (activeFilter === 'today') {
      return t.dueDate === todayISO();
    } else if (activeFilter === 'upcoming') {
      return t.dueDate > todayISO();
    }
    return true;
  });

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = '<div class="todo-left"><div class="todo-title" style="color:var(--muted)">Tidak ada tugas</div></div>';
    todoListEl.appendChild(li);
    return;
  }

  filtered.forEach(item => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = item.id;

    const left = document.createElement('div');
    left.className = 'todo-left';

    const title = document.createElement('div');
    title.className = 'todo-title';
    title.textContent = item.title;

    const date = document.createElement('div');
    date.className = 'todo-date';
    date.textContent = item.dueDate;

    left.appendChild(title);
    left.appendChild(date);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const del = document.createElement('button');
    del.className = 'small-btn';
    del.textContent = 'Hapus';
    del.addEventListener('click', () => {
      deleteTodo(item.id);
    });

    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);

    todoListEl.appendChild(li);
  });
};

const addTodo = (title, dueDate) => {
  const id = Date.now().toString();
  todos.push({ id, title, dueDate });
  saveTodos();
  render();
};

const deleteTodo = (id) => {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
};

const clearAll = () => {
  if (!confirm('Hapus semua tugas?')) return;
  todos = [];
  saveTodos();
  render();
};


const validateForm = () => {
  let ok = true;
  titleError.textContent = '';
  dateError.textContent = '';

  const title = titleInput.value.trim();
  const date = dateInput.value;

  if (!title) {
    titleError.textContent = 'Judul tugas wajib diisi';
    ok = false;
  }

  if (!date) {
    dateError.textContent = 'Tanggal wajib diisi';
    ok = false;
  } else {
    const selected = new Date(date);
    selected.setHours(0,0,0,0);
    const now = new Date();
    now.setHours(0,0,0,0);
    if (selected < now) {
      dateError.textContent = 'Tanggal tidak boleh di masa lalu';
      ok = false;
    }
  }

  return ok;
};


form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  addTodo(titleInput.value.trim(), dateInput.value);
  form.reset();
});

clearFormBtn.addEventListener('click', () => {
  form.reset();
  titleError.textContent = '';
  dateError.textContent = '';
});

searchInput.addEventListener('input', render);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

fromDate.addEventListener('change', render);
toDate.addEventListener('change', render);

clearAllBtn.addEventListener('click', clearAll);


loadTodos();
render();