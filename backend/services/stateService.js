// Все элементы: ID от 1 до 1 000 000
let allItems = Array.from({ length: 1_000_000 }, (_, i) => i + 1);

// Выбранные элементы (ID)
let selectedItems = [];

// Порядок сортировки (массив ID в нужном порядке)
let sortOrder = [];

// Добавление новых элементов (будет батчиться)
let newIdsBuffer = [];

// === Основные функции ===

export function getItems({ offset, limit, filter, selected }) {
  const filtered = allItems
    .filter(id => {
      const matchesFilter = filter ? id.toString().includes(filter) : true;
      const matchesSelected = selected ? selectedItems.includes(id) : !selectedItems.includes(id);
      return matchesFilter && matchesSelected;
    })
    .slice(offset, offset + limit);

  return {
    items: filtered,
    total: filtered.length, // В реальности можно точнее
    offset,
    limit,
  };
}

export function addNewItems(ids) {
  // Добавляем в буфер — будет обработано позже
  newIdsBuffer.push(...ids);
}

export function getSelection() {
  return { selected: selectedItems, sortOrder };
}

export function updateSelection(selected, newSortOrder) {
  selectedItems = [...new Set(selected)]; // Убираем дубли
  sortOrder = newSortOrder;
}

// === Экспорт для очереди ===
export function flushNewItems() {
  if (newIdsBuffer.length === 0) return;

  // Уникализируем и фильтруем
  const uniqueNewIds = [...new Set(newIdsBuffer)]
    .filter(id => typeof id === 'number' && id > 0 && !allItems.includes(id));

  allItems.push(...uniqueNewIds);
  newIdsBuffer = [];
  console.log(`✅ Added ${uniqueNewIds.length} new items`);
}

export function getStateSnapshot() {
  return { allItems, selectedItems, sortOrder };
}

export function restoreState(state) {
  if (state.allItems) allItems = state.allItems;
  if (state.selectedItems) selectedItems = state.selectedItems;
  if (state.sortOrder) sortOrder = state.sortOrder;
}