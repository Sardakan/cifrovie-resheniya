import { flushNewItems } from './stateService.js';

// Буфер для обновлений состояния (выбор/сортировка)
let pendingUpdates = null;

// === Батчинг добавления (раз в 10 сек) ===
setInterval(() => {
  flushNewItems();
}, 10_000);

// === Батчинг обновлений (раз в 1 сек) ===
setInterval(() => {
  if (pendingUpdates) {
    // Здесь можно сохранить в файл, БД, реплицировать и т.д.
    // Сейчас — просто лог
    console.log(`✅ State updated: selected=${pendingUpdates.selected.length}, sortOrder=${pendingUpdates.sortOrder.length}`);
    pendingUpdates = null;
  }
}, 1000);

// Экспортируем для API
export function queueUpdate(update) {
  pendingUpdates = update;
}