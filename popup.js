import {
  addTask,
  clearCompleted,
  deleteTask,
  getSettings,
  getTasks,
  saveSettings,
  updateTask,
} from "./storage.js";

const filterState = {
  selected: "all",
  search: "",
};

const ui = {
  addCurrentTabBtn: document.getElementById("addCurrentTabBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  clearCompletedBtn: document.getElementById("clearCompletedBtn"),
  statusMessage: document.getElementById("statusMessage"),
  autoCloseToggle: document.getElementById("autoCloseToggle"),
  searchInput: document.getElementById("searchInput"),
  filterButtons: [...document.querySelectorAll(".filter-btn")],
  taskList: document.getElementById("taskList"),
  emptyState: document.getElementById("emptyState"),
};

let statusTimerId = null;

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `task-${fallback}`;
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) {
      return a.done ? 1 : -1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function matchesFilter(task) {
  if (filterState.selected === "active") {
    return !task.done;
  }

  if (filterState.selected === "done") {
    return task.done;
  }

  return true;
}

function matchesSearch(task) {
  if (!filterState.search) {
    return true;
  }

  const needle = filterState.search.toLowerCase();
  return (
    String(task.title || "").toLowerCase().includes(needle) ||
    String(task.url || "").toLowerCase().includes(needle)
  );
}

function renderFilterButtons() {
  ui.filterButtons.forEach((btn) => {
    const active = btn.dataset.filter === filterState.selected;
    btn.classList.toggle("is-active", active);
  });
}

function setStatus(message, type = "info") {
  if (!ui.statusMessage) return;

  if (statusTimerId) {
    clearTimeout(statusTimerId);
  }

  ui.statusMessage.textContent = message;
  ui.statusMessage.classList.remove("is-info", "is-success", "is-warning");
  ui.statusMessage.classList.add(`is-${type}`);

  if (message) {
    statusTimerId = setTimeout(() => {
      ui.statusMessage.textContent = "";
      ui.statusMessage.classList.remove("is-info", "is-success", "is-warning");
    }, 2200);
  }
}

function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  try {
    const parsed = new URL(rawUrl);
    const protocol = parsed.protocol.toLowerCase();

    if (protocol !== "http:" && protocol !== "https:") {
      return rawUrl.trim();
    }

    parsed.hash = "";

    const trackingKeys = new Set([
      "fbclid",
      "gclid",
      "dclid",
      "msclkid",
      "mc_cid",
      "mc_eid",
      "igshid",
      "_hsenc",
      "_hsmi",
      "mkt_tok",
      "oly_anon_id",
      "oly_enc_id",
      "vero_conv",
      "vero_id",
      "wickedid",
      "yclid",
    ]);

    const cleanEntries = [];
    for (const [key, value] of parsed.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith("utm_")) continue;
      if (trackingKeys.has(lowerKey)) continue;
      cleanEntries.push([key, value]);
    }

    cleanEntries.sort((a, b) => {
      if (a[0] === b[0]) return a[1].localeCompare(b[1]);
      return a[0].localeCompare(b[0]);
    });

    const cleanParams = new URLSearchParams();
    cleanEntries.forEach(([key, value]) => cleanParams.append(key, value));

    parsed.search = cleanParams.toString();

    if (
      (parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443")
    ) {
      parsed.port = "";
    }

    if (parsed.pathname.length > 1) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
      if (!parsed.pathname) {
        parsed.pathname = "/";
      }
    }

    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

function getTimestamp(value) {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = `task-item${task.done ? " is-done" : ""}`;

  const left = document.createElement("div");
  left.className = "task-main";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(task.done);
  checkbox.setAttribute("aria-label", `Mark task ${task.title || "(untitled)"}`);
  checkbox.addEventListener("change", async () => {
    const now = new Date().toISOString();
    await updateTask(task.id, {
      done: checkbox.checked,
      doneAt: checkbox.checked ? now : null,
      updatedAt: now,
    });
    await loadAndRenderTasks();
  });

  const titleButton = document.createElement("button");
  titleButton.type = "button";
  titleButton.className = "task-title";
  titleButton.textContent = task.title || task.url || "Untitled tab";
  titleButton.title = task.url || "";
  titleButton.addEventListener("click", async () => {
    if (!task.url) return;
    await chrome.tabs.create({ url: task.url });
  });

  const meta = document.createElement("p");
  meta.className = "task-meta";
  meta.textContent = task.url || "";

  const editWrap = document.createElement("div");
  editWrap.className = "task-edit";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "task-edit-input";
  editInput.value = task.title || "";
  editInput.maxLength = 300;

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "btn btn-small";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-small";
  cancelBtn.textContent = "Cancel";

  const right = document.createElement("div");
  right.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-small";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn-small btn-danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", async () => {
    await deleteTask(task.id);
    await loadAndRenderTasks();
  });

  left.appendChild(checkbox);

  const textWrap = document.createElement("div");
  textWrap.className = "task-text";
  textWrap.appendChild(titleButton);
  textWrap.appendChild(meta);
  editWrap.appendChild(editInput);
  editWrap.appendChild(saveBtn);
  editWrap.appendChild(cancelBtn);
  textWrap.appendChild(editWrap);

  left.appendChild(textWrap);
  right.appendChild(editBtn);
  right.appendChild(deleteBtn);

  function toggleEditMode(enabled) {
    li.classList.toggle("is-editing", enabled);
    if (enabled) {
      editInput.focus();
      editInput.select();
    }
  }

  async function saveTitle() {
    const nextTitle = editInput.value.trim();
    if (!nextTitle) {
      setStatus("Title cannot be empty.", "warning");
      return;
    }

    if (nextTitle === (task.title || "")) {
      toggleEditMode(false);
      return;
    }

    await updateTask(task.id, {
      title: nextTitle,
      updatedAt: new Date().toISOString(),
    });
    setStatus("Task title updated.", "success");
    await loadAndRenderTasks();
  }

  editBtn.addEventListener("click", () => {
    toggleEditMode(true);
  });
  cancelBtn.addEventListener("click", () => {
    editInput.value = task.title || "";
    toggleEditMode(false);
  });
  saveBtn.addEventListener("click", () => {
    saveTitle();
  });
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTitle();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      editInput.value = task.title || "";
      toggleEditMode(false);
    }
  });

  li.appendChild(left);
  li.appendChild(right);

  return li;
}

function renderTasks(tasks) {
  ui.taskList.innerHTML = "";

  const visibleTasks = sortTasks(tasks).filter((task) => matchesFilter(task) && matchesSearch(task));

  if (visibleTasks.length === 0) {
    ui.emptyState.hidden = false;
    return;
  }

  ui.emptyState.hidden = true;

  const fragment = document.createDocumentFragment();
  visibleTasks.forEach((task) => fragment.appendChild(createTaskItem(task)));
  ui.taskList.appendChild(fragment);
}

async function loadAndRenderTasks() {
  const tasks = await getTasks();
  renderTasks(tasks);
}

async function loadSettings() {
  const settings = await getSettings();
  ui.autoCloseToggle.checked = Boolean(settings.autoCloseTabAfterAdd);
}

async function handleAddCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  if (!activeTab) {
    setStatus("No active tab found.", "warning");
    return;
  }

  const activeTabUrl = activeTab.url || "";
  if (!activeTabUrl) {
    setStatus("Cannot add this tab (missing URL).", "warning");
    return;
  }

  const normalizedCurrentUrl = normalizeUrl(activeTabUrl);
  if (!normalizedCurrentUrl) {
    setStatus("Cannot normalize tab URL.", "warning");
    return;
  }

  const tasks = await getTasks();
  const matchingTasks = tasks.filter((task) => normalizeUrl(task.url || "") === normalizedCurrentUrl);

  const activeDuplicate = matchingTasks.find((task) => !task.done);
  if (activeDuplicate) {
    setStatus("Task with this URL already exists.", "warning");
    return;
  }

  if (matchingTasks.length > 0) {
    const doneDuplicate = [...matchingTasks]
      .filter((task) => task.done)
      .sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt))[0];

    if (doneDuplicate) {
      const now = new Date().toISOString();
      await updateTask(doneDuplicate.id, {
        done: false,
        doneAt: null,
        updatedAt: now,
        url: normalizedCurrentUrl,
      });
      await loadAndRenderTasks();
      setStatus("Completed task restored to active.", "success");

      const settings = await getSettings();
      if (settings.autoCloseTabAfterAdd && typeof activeTab.id === "number") {
        await chrome.tabs.remove(activeTab.id);
      }
      return;
    }
  }

  const now = new Date().toISOString();
  const task = {
    id: createId(),
    url: normalizedCurrentUrl,
    title: activeTab.title || normalizedCurrentUrl || "Untitled tab",
    createdAt: now,
    updatedAt: now,
    done: false,
    doneAt: null,
  };

  await addTask(task);
  await loadAndRenderTasks();
  setStatus("Task added.", "success");

  const settings = await getSettings();
  if (settings.autoCloseTabAfterAdd && typeof activeTab.id === "number") {
    await chrome.tabs.remove(activeTab.id);
  }
}

function bindEvents() {
  ui.addCurrentTabBtn.addEventListener("click", async () => {
    await handleAddCurrentTab();
  });

  ui.refreshBtn.addEventListener("click", async () => {
    await loadAndRenderTasks();
    await loadSettings();
  });

  ui.clearCompletedBtn.addEventListener("click", async () => {
    await clearCompleted();
    await loadAndRenderTasks();
  });

  ui.autoCloseToggle.addEventListener("change", async () => {
    await saveSettings({
      autoCloseTabAfterAdd: ui.autoCloseToggle.checked,
    });
  });

  ui.searchInput.addEventListener("input", () => {
    filterState.search = ui.searchInput.value.trim();
    loadAndRenderTasks();
  });

  ui.filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterState.selected = btn.dataset.filter || "all";
      renderFilterButtons();
      loadAndRenderTasks();
    });
  });
}

async function init() {
  renderFilterButtons();
  bindEvents();
  await loadSettings();
  await loadAndRenderTasks();
}

init();
