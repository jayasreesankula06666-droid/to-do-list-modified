const form = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const fromInput = document.getElementById('from-date');
const toInput = document.getElementById('to-date');
const fromDay = document.getElementById('from-day');
const toDay = document.getElementById('to-day');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const taskCount = document.getElementById('task-count');
const formError = document.getElementById('form-error');
const clearCompletedButton = document.getElementById('clear-completed');
const STORAGE_KEY = 'student-todo-from-to-v1';
let tasks = loadTasks();

function loadTasks() {
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return Array.isArray(saved) ? saved : []; }
  catch { return []; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function parseLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function formatDateWithDay(value) {
  const date = parseLocalDate(value);
  if (!date || Number.isNaN(date.getTime())) return 'Date not set';
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
function formatCreatedDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}
function updateDayLabels() {
  fromDay.textContent = fromInput.value ? formatDateWithDay(fromInput.value) : 'Choose a start date';
  toDay.textContent = toInput.value ? formatDateWithDay(toInput.value) : 'Choose an end date';
  toInput.min = fromInput.value || '';
  fromInput.max = toInput.value || '';
}
fromInput.addEventListener('change', () => {
  if (fromInput.value && toInput.value && toInput.value < fromInput.value) toInput.value = fromInput.value;
  formError.textContent = '';
  updateDayLabels();
});
toInput.addEventListener('change', () => {
  if (fromInput.value && toInput.value && toInput.value < fromInput.value) {
    formError.textContent = 'The To date cannot be earlier than the From date.';
    toInput.value = fromInput.value;
  } else formError.textContent = '';
  updateDayLabels();
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = taskInput.value.trim(), fromDate = fromInput.value, toDate = toInput.value;
  if (!title) { formError.textContent = 'Please enter a task name.'; return; }
  if (!fromDate || !toDate) { formError.textContent = 'Please choose both dates.'; return; }
  if (toDate < fromDate) { formError.textContent = 'The To date cannot be earlier than the From date.'; return; }
  tasks.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    title, fromDate, toDate, completed: false, createdAt: new Date().toISOString()
  });
  saveTasks(); renderTasks(); form.reset(); formError.textContent = ''; updateDayLabels(); taskInput.focus();
});
function renderTasks() {
  taskList.replaceChildren();
  tasks.forEach((task) => {
    const item = document.createElement('li'); item.className = `task${task.completed ? ' completed' : ''}`;
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute('aria-label', `Mark ${task.title} completed`);
    checkbox.addEventListener('change', () => { task.completed = checkbox.checked; saveTasks(); renderTasks(); });
    const details = document.createElement('div');
    const title = document.createElement('p'); title.className = 'task-title'; title.textContent = task.title;
    const dates = document.createElement('div'); dates.className = 'task-dates';
    dates.textContent = `From: ${formatDateWithDay(task.fromDate)} · To: ${formatDateWithDay(task.toDate)}`;
    const created = document.createElement('div'); created.className = 'created'; created.textContent = `Added: ${formatCreatedDate(task.createdAt)}`;
    details.append(title, dates, created);
    const deleteButton = document.createElement('button'); deleteButton.type = 'button'; deleteButton.className = 'delete-btn'; deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('aria-label', `Delete ${task.title}`);
    deleteButton.addEventListener('click', () => { tasks = tasks.filter(entry => entry.id !== task.id); saveTasks(); renderTasks(); });
    item.append(checkbox, details, deleteButton); taskList.append(item);
  });
  const remaining = tasks.filter(task => !task.completed).length;
  taskCount.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${remaining} remaining`;
  emptyState.hidden = tasks.length > 0;
  clearCompletedButton.disabled = !tasks.some(task => task.completed);
  clearCompletedButton.style.opacity = clearCompletedButton.disabled ? '0.55' : '1';
}
clearCompletedButton.addEventListener('click', () => { tasks = tasks.filter(task => !task.completed); saveTasks(); renderTasks(); });
updateDayLabels(); renderTasks();
