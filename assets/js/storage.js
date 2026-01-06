/**
 * Storage abstraction for Task Manager
 * ------------------------------------
 * Bertanggung jawab untuk:
 * - Save / load task dari localStorage
 * - Validasi data hasil parsing
 * - Error handling jika data corrupt
 */

const STORAGE_KEY = "task_manager_tasks";

/**
 * Validasi struktur task
 * @param {any} task
 * @returns {boolean}
 */
function isValidTask(task) {
  return (
    typeof task === "object" &&
    task !== null &&
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.completed === "boolean" &&
    typeof task.createdAt === "string"
  );
}

/**
 * Simpan tasks ke localStorage
 * @param {Array} tasks
 */
function saveTasksToStorage(tasks) {
  try {
    if (!Array.isArray(tasks)) {
      throw new Error("Tasks harus berupa array");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Gagal menyimpan tasks ke storage:", error);
  }
}

/**
 * Load tasks dari localStorage
 * @returns {Array}
 */
function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error("Format data storage tidak valid");
    }

    // Filter hanya task yang valid
    return parsed.filter(isValidTask);
  } catch (error) {
    console.warn("Storage rusak atau tidak valid. Reset storage.");
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

/**
 * Hapus semua data dari storage
 */
function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

/*
 * Export ke global scope
 */
window.TaskStorage = {
  saveTasksToStorage,
  loadTasksFromStorage,
  clearStorage,
};
