document.addEventListener("DOMContentLoaded", () => {
  // ===== THEME HANDLING =====
  const themeToggle = document.getElementById("themeToggle");

  initTheme();
  themeToggle.addEventListener("click", toggleTheme);

  function initTheme() {
    const savedTheme = localStorage.getItem("theme");

    const theme = savedTheme
      ? savedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    document.documentElement.setAttribute("data-theme", theme);
  }

  function toggleTheme() {
    const root = document.documentElement;
    const body = document.body;

    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    // 1. Aktifkan fade overlay
    body.classList.add("theme-transition");

    // 2. Tunggu sebentar sebelum ganti theme
    setTimeout(() => {
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    }, 120);

    // 3. Lepas overlay setelah selesai
    setTimeout(() => {
      body.classList.remove("theme-transition");
    }, 350);
  }

  // ===== DOM =====
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");

  const activeCountEl = document.getElementById("activeCount");
  const completedCountEl = document.getElementById("completedCount");

  // ===== UI STATE =====
  let currentFilter = "all";
  let searchQuery = "";

  // ===== INIT =====
  initApp();

  function initApp() {
    const storedTasks = TaskStorage.loadTasksFromStorage();
    TaskModel.setTasks(storedTasks);
    syncAndRender();
  }

  // ===== EVENTS =====
  taskForm.addEventListener("submit", handleAddTask);

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  function handleAddTask(e) {
    e.preventDefault();
    try {
      TaskModel.createTask(taskInput.value);
      taskInput.value = "";
      taskInput.focus();
      syncAndRender();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleToggle(id) {
    TaskModel.toggleTask(id);
    syncAndRender();
  }

  function handleDelete(id) {
    if (!confirm("Hapus task ini?")) return;
    TaskModel.deleteTask(id);
    syncAndRender();
  }

  // ===== RENDER =====
  function renderTasks() {
    let tasks = TaskModel.getFilteredTasks(currentFilter);

    if (searchQuery) {
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(searchQuery));
    }

    taskList.innerHTML = "";

    if (tasks.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = `task-item ${task.completed ? "completed" : ""}`;

      li.innerHTML = `
        <span class="task-title">${escapeHtml(task.title)}</span>
        <div class="task-actions">
          <button class="edit-btn">✏️</button>
          <button class="toggle-btn">${task.completed ? "↩️" : "✅"}</button>
          <button class="delete-btn">🗑️</button>
        </div>
      `;

      li.querySelector(".toggle-btn").onclick = () => handleToggle(task.id);
      li.querySelector(".delete-btn").onclick = () => handleDelete(task.id);
      li.querySelector(".edit-btn").onclick = () => startEditTask(task, li);

      taskList.appendChild(li);
    });
  }

  // ===== EDIT =====
  function startEditTask(task, listItem) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.title;
    input.className = "edit-input";

    listItem.querySelector(".task-title").replaceWith(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
      if (e.key === "Escape") renderTasks();
    });

    input.addEventListener("blur", save);

    function save() {
      try {
        TaskModel.updateTask(task.id, input.value);
        syncAndRender();
      } catch (err) {
        alert(err.message);
        renderTasks();
      }
    }
  }

  // ===== COUNTER (ANIMATED) =====
  function updateCounter() {
    const tasks = TaskModel.getTasks();
    const completed = tasks.filter((t) => t.completed).length;
    const active = tasks.length - completed;

    animateNumber(activeCountEl, active);
    animateNumber(completedCountEl, completed);
  }

  function animateNumber(el, target) {
    const start = Number(el.textContent) || 0;
    const duration = 200;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      el.textContent = Math.round(start + (target - start) * progress);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ===== SYNC =====
  function syncAndRender() {
    TaskStorage.saveTasksToStorage(TaskModel.getTasks());
    updateCounter();
    renderTasks();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
