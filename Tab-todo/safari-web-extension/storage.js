const STORAGE_KEY_TASKS = "tasks";
const STORAGE_KEY_SETTINGS = "settings";

const DEFAULT_STORAGE = {
  tasks: [],
  settings: {
    autoCloseTabAfterAdd: false,
  },
};

const ext = globalThis.browser ?? globalThis.chrome;

function isThenable(value) {
  return value && typeof value.then === "function";
}

function storageGet(keys) {
  try {
    const maybePromise = ext.storage.local.get(keys);
    if (isThenable(maybePromise)) {
      return maybePromise;
    }
  } catch {
    // Fallback to callback mode.
  }

  return new Promise((resolve, reject) => {
    ext.storage.local.get(keys, (result) => {
      const err = ext.runtime?.lastError;
      if (err) {
        reject(new Error(err.message || "storage.get failed"));
        return;
      }
      resolve(result || {});
    });
  });
}

function storageSet(payload) {
  try {
    const maybePromise = ext.storage.local.set(payload);
    if (isThenable(maybePromise)) {
      return maybePromise;
    }
  } catch {
    // Fallback to callback mode.
  }

  return new Promise((resolve, reject) => {
    ext.storage.local.set(payload, () => {
      const err = ext.runtime?.lastError;
      if (err) {
        reject(new Error(err.message || "storage.set failed"));
        return;
      }
      resolve();
    });
  });
}

function toValidTasks(value) {
  return Array.isArray(value) ? value : [];
}

function toValidSettings(value) {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_STORAGE.settings };
  }

  return {
    autoCloseTabAfterAdd: Boolean(value.autoCloseTabAfterAdd),
  };
}

async function ensureStorageInitialized() {
  const current = await storageGet([STORAGE_KEY_TASKS, STORAGE_KEY_SETTINGS]);

  const tasks = toValidTasks(current[STORAGE_KEY_TASKS]);
  const settings = toValidSettings(current[STORAGE_KEY_SETTINGS]);

  const needsTasksInit = !Array.isArray(current[STORAGE_KEY_TASKS]);
  const needsSettingsInit =
    !current[STORAGE_KEY_SETTINGS] || typeof current[STORAGE_KEY_SETTINGS] !== "object";

  if (needsTasksInit || needsSettingsInit) {
    await storageSet({
      [STORAGE_KEY_TASKS]: tasks,
      [STORAGE_KEY_SETTINGS]: settings,
    });
  }

  return { tasks, settings };
}

export async function getTasks() {
  const { tasks } = await ensureStorageInitialized();
  return tasks;
}

export async function saveTasks(tasks) {
  const safeTasks = toValidTasks(tasks);
  await storageSet({ [STORAGE_KEY_TASKS]: safeTasks });
  return safeTasks;
}

export async function addTask(task) {
  const tasks = await getTasks();
  const nextTasks = [task, ...tasks];
  await saveTasks(nextTasks);
  return task;
}

export async function updateTask(id, patch) {
  const tasks = await getTasks();
  let updatedTask = null;

  const nextTasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    updatedTask = { ...task, ...patch };
    return updatedTask;
  });

  await saveTasks(nextTasks);
  return updatedTask;
}

export async function deleteTask(id) {
  const tasks = await getTasks();
  const nextTasks = tasks.filter((task) => task.id !== id);
  await saveTasks(nextTasks);
  return nextTasks;
}

export async function clearCompleted() {
  const tasks = await getTasks();
  const nextTasks = tasks.filter((task) => !task.done);
  await saveTasks(nextTasks);
  return nextTasks;
}

export async function getSettings() {
  const { settings } = await ensureStorageInitialized();
  return settings;
}

export async function saveSettings(settings) {
  const safeSettings = toValidSettings(settings);
  await storageSet({ [STORAGE_KEY_SETTINGS]: safeSettings });
  return safeSettings;
}
