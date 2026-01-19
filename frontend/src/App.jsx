import { useState, useEffect } from 'react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';

import {
    getItems,
    getSelection,
    updateSelection,
    addNewItems,
} from './services/api';

export default function App() {
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelected] = useState([]);
    const [sortOrder, setSortOrder] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [filter, setFilter] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [filterRight, setFilterRight] = useState('');
    const [newId, setNewId] = useState('');
    const [offsetRight, setOffsetRight] = useState(0);
    const [limitRight] = useState(20);
    const [loadingRight, setLoadingRight] = useState(false);
    const [hasMoreRight, setHasMoreRight] = useState(true);


    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Загрузка состояния
    useEffect(() => {
        getSelection()
            .then(res => {
                setSelected(res.data.selected);
                setSortOrder(res.data.sortOrder);
            })
            .catch(console.error);
    }, []);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const response = await getItems(offset, 20, filter, false);
            const newItems = response.data.items.filter(id => !selectedItems.includes(id));
            setAvailableItems(prev => {
                const seen = new Set(prev);
                return [...prev, ...newItems.filter(id => !seen.has(id))];
            });
            if (newItems.length < 20) setHasMore(false);
            setOffset(prev => prev + 20);
        } catch (err) {
            console.error('Failed to load items', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreRight = async () => {
        if (loadingRight || !hasMoreRight) return;
        setLoadingRight(true);

        try {
            // Получаем полный отсортированный список
            const filtered = sortOrder
                .filter(id => String(id).includes(filterRight) && selectedItems.includes(id));

            // Порция по 20
            const nextItems = filtered.slice(offsetRight, offsetRight + limitRight);

            // Если меньше 20 — дальше не грузим
            if (nextItems.length < limitRight) {
                setHasMoreRight(false);
            }

            // Увеличиваем offset
            setOffsetRight(prev => prev + limitRight);
        } catch (err) {
            console.error('Failed to load more in right panel', err);
        } finally {
            setLoadingRight(false);
        }
    };


    useEffect(() => {
        setAvailableItems([]);
        setOffset(0);
        setHasMore(true);
        const timer = setTimeout(() => loadMore(), 100);
        return () => clearTimeout(timer);
    }, [filter]);

    useEffect(() => {
        setSortOrder(prev => {
            const stillSelected = prev.filter(id => selectedItems.includes(id));
            const newOnes = selectedItems.filter(id => !prev.includes(id));
            return [...stillSelected, ...newOnes];
        });
    }, [selectedItems]);

    useEffect(() => {
        if (selectedItems.length === 0 && sortOrder.length === 0) return;
        const timer = setTimeout(() => {
            updateSelection(selectedItems, sortOrder).catch(console.error);
        }, 1000);
        return () => clearTimeout(timer);
    }, [selectedItems, sortOrder]);

    useEffect(() => {
        setOffsetRight(0);
        setHasMoreRight(true);
        const timer = setTimeout(() => {
            loadMoreRight();
        }, 100);
        return () => clearTimeout(timer);
    }, [filterRight, sortOrder]);

    const selectItem = (id) => {
        setSelected(prev => [...prev, id]);
        setAvailableItems(prev => prev.filter(item => item !== id));
    };

    const handleAddNewId = () => {
        const id = parseInt(newId.trim(), 10);
        if (isNaN(id) || id <= 0) {
            alert('Введите положительное целое число');
            return;
        }
        addNewItems([id]);
        setNewId('');
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setSortOrder((items) => {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const handleScrollLeft = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loading && hasMore) {
            loadMore();
        }
    };

    const handleScrollRight = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 100 && !loadingRight && hasMoreRight) {
            loadMoreRight();
        }
    };

    const filteredSelected = sortOrder
        .filter(id => String(id).includes(filterRight))
        .filter(id => selectedItems.includes(id));

    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'Arial' }}>
            {/* Левое окно */}
            <div style={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}>
                <h3>📦 Доступные элементы</h3>

                {/* Фильтр */}
                <input
                    placeholder="Фильтр по ID"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginBottom: '10px', width: '100%' }}
                />

                {/* Добавление нового ID */}
                <div style={{ marginBottom: '10px', display: 'flex', gap: '8px' }}>
                    <input
                        placeholder="Новый ID"
                        value={newId}
                        onChange={(e) => setNewId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNewId()}
                        style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    />
                    <button
                        onClick={handleAddNewId}
                        style={{
                            padding: '8px 12px',
                            background: '#0078d7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        +
                    </button>
                </div>

                {/* Список элементов */}
                <div
                    onScroll={handleScrollLeft}
                    style={{ height: '60vh', overflowY: 'auto', border: '1px dashed #aaa', padding: '10px' }}
                >
                    {availableItems.map(item => (
                        <div
                            key={item}
                            onClick={() => selectItem(item)}
                            style={{
                                padding: '8px',
                                margin: '4px 0',
                                background: '#f9f9f9',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            ID: {item}
                        </div>
                    ))}
                    {loading && <div>Загрузка...</div>}
                    {!hasMore && !loading && <div>Больше нет</div>}
                </div>
            </div>

            {/* Правое окно */}
            <div style={{ flex: 1, border: '1px solid #0078d7', borderRadius: '8px', padding: '10px' }}>
                <h3>✅ Выбранные элементы (Drag & Drop)</h3>
                <input
                    placeholder="Фильтр по ID"
                    value={filterRight}
                    onChange={(e) => setFilterRight(e.target.value)}
                    style={{ marginBottom: '10px', width: '100%' }}
                />
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={sortOrder} strategy={verticalListSortingStrategy}>
                        <div
                            onScroll={handleScrollRight}
                            style={{ height: '70vh', overflowY: 'auto', border: '1px dashed #0078d7', padding: '10px' }}
                        >
                            {sortOrder
                                .filter(id => String(id).includes(filterRight) && selectedItems.includes(id))
                                .slice(0, offsetRight)
                                .map((id) => (
                                    <SortableItem key={id} id={id} />
                                ))}
                            {loadingRight && <div>Загрузка...</div>}
                            {!hasMoreRight && !loadingRight && <div>Больше нет</div>}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

        </div>
    );
}

function SortableItem({ id }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        transition,
        padding: '8px',
        margin: '4px 0',
        background: '#e3f2fd',
        border: '1px solid #bbdefb',
        borderRadius: '4px',
        fontWeight: '500',
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            ID: {id}
        </div>
    );
}