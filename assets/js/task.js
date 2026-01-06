/**
 * Task data model & state management
 * ---------------------------------
 * Bertanggung jawab untuk:
 * - Menyimpan state task di memory
 * - CRUD operations (create, read, update, delete)
 * - Tidak menyentuh DOM atau storage
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique identifier
 * @property {string} title - Task title
 * @property {boolean} completed - Completion status
 * @property {string} createdAt - ISO timestamp
 */

/** @type {Task[]} */
let tasks = [];

/**
 * Generate unique ID untuk task
 * Menggunakan crypto API jika tersedia
 * @returns {string}
 */
function generateId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback (browser lama)
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Validasi judul task
 * @param {string} title
 * @throws {Error}
 */
function validateTitle(title) {
  if (typeof title !== "string") {
    throw new Error("Task title harus berupa string");
  }

  if (title.trim().length === 0) {
    throw new Error("Task title tidak boleh kosong");
  }
}

/**
 * Create task baru
 * @param {string} title
 * @returns {Task}
 */
function createTask(title) {
  validateTitle(title);

  const newTask = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return newTask;
}

/**
 * Ambil semua task (immutable copy)
 * @returns {Task[]}
 */
function getTasks() {
  return [...tasks];
}

/**
 * Toggle status completed task
 * @param {string} taskId
 * @returns {Task}
 */
function toggleTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    throw new Error("Task tidak ditemukan");
  }

  task.completed = !task.completed;
  return task;
}

/**
 * Hapus task berdasarkan ID
 * @param {string} taskId
 */
function deleteTask(taskId) {
  const index = tasks.findIndex((t) => t.id === taskId);

  if (index === -1) {
    throw new Error("Task tidak ditemukan");
  }

  tasks.splice(index, 1);
}

/**
 * Set initial state (dipakai saat load dari storage)
 * @param {Task[]} initialTasks
 */
function setTasks(initialTasks) {
  if (!Array.isArray(initialTasks)) {
    throw new Error("Initial tasks harus berupa array");
  }

  tasks = [...initialTasks];
}

/**
 * Clear semua task (optional utility)
 */
function clearTasks() {
  tasks = [];
}

/**
 * Ambil task berdasarkan filter
 * @param {"all" | "active" | "completed"} filter
 * @returns {Task[]}
 */
function getFilteredTasks(filter) {
  switch (filter) {
    case "active":
      return tasks.filter((t) => !t.completed);
    case "completed":
      return tasks.filter((t) => t.completed);
    case "all":
    default:
      return [...tasks];
  }
}

/**
 * Update judul task
 * @param {string} taskId
 * @param {string} newTitle
 * @returns {Task}
 */
function updateTask(taskId, newTitle) {
  validateTitle(newTitle);

  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    throw new Error("Task tidak ditemukan");
  }

  task.title = newTitle.trim();
  return task;
}

/*
 * Export ke global scope
 * (karena kita pakai vanilla JS tanpa bundler)
 */
window.TaskModel = {
  createTask,
  getTasks,
  getFilteredTasks,
  toggleTask,
  updateTask,
  deleteTask,
  setTasks,
  clearTasks,
};
