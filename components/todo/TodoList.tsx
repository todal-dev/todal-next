'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  expanded?: boolean;
  color?: string; // 색상 추가
  // date 없음 - 항상 표시
}

interface TodoItem {
  id: string;
  name: string;
  completed: boolean;
  parentId?: string; // 카테고리 ID 또는 다른 항목 ID
  expanded?: boolean;
  date?: Date;
}

interface TodoListProps {
  selectedDate?: Date;
}

export function TodoList({ selectedDate = new Date() }: TodoListProps) {
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat1', name: '학교', expanded: true, color: 'bg-blue-500 text-blue-600' },
    { id: 'cat2', name: '회사', expanded: true, color: 'bg-green-500 text-green-600' },
    { id: 'cat3', name: '개인', expanded: true, color: 'bg-purple-500 text-purple-600' },
  ]);

  const [items, setItems] = useState<TodoItem[]>([
    { id: 'item1-1', name: 'ai 공부하기', completed: false, parentId: 'cat1', expanded: true, date: new Date(2025, 9, 14) },
    { id: 'item1-1-1', name: 'mcp에 대해 알아보기', completed: false, parentId: 'item1-1', date: new Date(2025, 9, 14) },
    { id: 'item1-2', name: '프로젝트', completed: false, parentId: 'cat1', date: new Date(2025, 9, 14) },
    { id: 'item2-1', name: '회의 준비', completed: false, parentId: 'cat2', date: new Date(2025, 9, 15) },
    { id: 'item3-1', name: '독서', completed: true, parentId: 'cat3', date: new Date(2025, 9, 16) },
  ]);

  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // 색상 배열 (상수로 추출)
  const colors = [
    { className: 'bg-blue-500 text-blue-600', hex: '#3b82f6' },
    { className: 'bg-green-500 text-green-600', hex: '#22c55e' },
    { className: 'bg-purple-500 text-purple-600', hex: '#a855f7' },
    { className: 'bg-red-500 text-red-600', hex: '#ef4444' },
    { className: 'bg-yellow-500 text-yellow-600', hex: '#eab308' },
    { className: 'bg-pink-500 text-pink-600', hex: '#ec4899' },
    { className: 'bg-indigo-500 text-indigo-600', hex: '#6366f1' },
    { className: 'bg-cyan-500 text-cyan-600', hex: '#06b6d4' },
  ];

  const [selectedCategoryColor, setSelectedCategoryColor] = useState(colors[0]);

  // 선택된 날짜의 할일만 필터링 (카테고리 제외)
  // const filteredItems = useMemo(() => {
  //   return items.filter((item) => {
  //     if (!item.date) return false;
  //     return (
  //       item.date.getFullYear() === selectedDate.getFullYear() &&
  //       item.date.getMonth() === selectedDate.getMonth() &&
  //       item.date.getDate() === selectedDate.getDate()
  //     );
  //   });
  // }, [items, selectedDate]);

  const handleAddCategory = () => {
    if (!newItemName.trim() || addingTo !== 'category-new') return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newItemName,
      expanded: true,
      color: selectedCategoryColor.className,
    };

    setCategories([...categories, newCategory]);
    setNewItemName('');
    setAddingTo(null);
    setSelectedCategoryColor(colors[0]);
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !addingTo) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      name: newItemName,
      completed: false,
      parentId: addingTo,
      expanded: true,
      date: selectedDate,
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setAddingTo(null);
  };

  const handleToggleItem = (id: string) => {
    setItems(prevItems => {
      const updated = prevItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );

      // 하위 항목들도 함께 완료/미완료 처리
      const toggledItem = updated.find(i => i.id === id);
      if (toggledItem) {
        const updateChildren = (parentId: string, completed: boolean) => {
          updated.forEach(item => {
            if (item.parentId === parentId) {
              item.completed = completed;
              updateChildren(item.id, completed);
            }
          });
        };
        updateChildren(id, toggledItem.completed);
      }

      // 상위 항목 자동 업데이트
      const item = updated.find(i => i.id === id);
      if (item?.parentId) {
        const updateParent = (parentId: string) => {
          const children = updated.filter(i => i.parentId === parentId);
          if (children.length > 0) {
            const allCompleted = children.every(c => c.completed);
            const parent = updated.find(i => i.id === parentId);
            if (parent) {
              parent.completed = allCompleted;
              if (parent.parentId) {
                updateParent(parent.parentId);
              }
            }
          }
        };
        updateParent(item.parentId);
      }

      return updated;
    });
  };

  const handleDeleteItem = (id: string) => {
    const deleteItem = (itemId: string) => {
      const children = items.filter(item => item.parentId === itemId);
      children.forEach(child => deleteItem(child.id));
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };
    deleteItem(id);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    
    // 드래그 이미지 설정 (투명한 이미지)
    const dragImage = new Image();
    dragImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedItem = items.find((i) => i.id === draggedId);
    if (!draggedItem) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // 드래그 항목을 드롭 대상의 자식으로 만들기 (parentId 변경)
    const newItems = items.map((item) =>
      item.id === draggedId
        ? { ...item, parentId: targetId }
        : item
    );

    setItems(newItems);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const getChildItems = (parentId: string) =>
    items.filter(item => item.parentId === parentId);

  const renderItemTree = (parentId: string, depth: number = 0) => {
    // 현재 날짜 필터링 적용
    const allChildren = getChildItems(parentId);
    const items_list = allChildren.filter(item => 
      item.date &&
      item.date.getFullYear() === selectedDate.getFullYear() &&
      item.date.getMonth() === selectedDate.getMonth() &&
      item.date.getDate() === selectedDate.getDate()
    );
    const marginLeft = depth * 16;

    return (
      <div className="flex flex-col gap-1">
        {/* Add Item Input - 카테고리 할일 추가 */}
        {parentId !== 'category-root' && addingTo === parentId && depth === 0 && (
          <div className="flex gap-2 py-2 border-b border-neutral-gray-100" style={{ marginLeft: `${marginLeft}px` }}>
            <Input
              type="text"
              placeholder="할일 이름"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              autoFocus
              className="flex-1"
            />
            <button
              onClick={handleAddItem}
              className="px-3 py-1 text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors cursor-pointer text-sm font-medium"
            >
              추가
            </button>
            <button
              onClick={() => {
                setAddingTo(null);
                setNewItemName('');
              }}
              className="px-3 py-1 text-neutral-text-secondary hover:bg-neutral-gray-100 rounded transition-colors cursor-pointer text-sm font-medium"
            >
              취소
            </button>
          </div>
        )}

        {items_list.map((item) => {
          const hasChildren = items.some(i => i.parentId === item.id);

          return (
            <div key={item.id}>
              {/* Drop Indicator - 위쪽 */}
              {draggedId && dragOverId === item.id && (
                <div className="h-0.5 bg-primary-500 mx-3 mb-1" />
              )}

              {/* Item Row */}
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md
                  hover:bg-neutral-gray-100 transition-all cursor-grab active:cursor-grabbing
                  user-select-none
                  ${item.completed ? 'opacity-60' : ''}
                  ${draggedId === item.id ? 'opacity-50 bg-primary-100 shadow-lg scale-95' : ''}
                  ${dragOverId === item.id && draggedId ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''}
                `}
                style={{ marginLeft: `${marginLeft}px` }}
                draggable
                onDragStart={(e) => handleDragStart(e as any, item.id)}
                onDragOver={(e) => handleDragOver(e as any, item.id)}
                onDrop={(e) => handleDrop(e as any, item.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Expand/Collapse Button */}
                <div className="flex-shrink-0 w-6" />

                {/* Checkbox */}
                <Checkbox
                  checked={item.completed}
                  onChange={() => handleToggleItem(item.id)}
                  className="flex-shrink-0"
                />

                {/* Item Name */}
                <span
                  className={`
                    flex-1 text-sm
                    ${item.completed
                      ? 'line-through text-neutral-text-tertiary'
                      : 'text-neutral-text-primary'
                    }
                  `}
                >
                  {item.name}
                </span>

                {/* Add Sub Item Button */}
                <button
                  onClick={() => setAddingTo(item.id)}
                  className="flex-shrink-0 p-1 hover:bg-neutral-gray-300 rounded transition-colors text-neutral-text-secondary hover:text-status-success"
                  title="하위 항목 추가"
                >
                  <Plus size={14} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors text-neutral-text-tertiary hover:text-status-error"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Add Item Input */}
              {addingTo === item.id && (
                <div className="mt-1 ml-2 flex gap-2 py-2 border-b border-neutral-gray-100" style={{ marginLeft: `${marginLeft + 32}px` }}>
                  <Input
                    type="text"
                    placeholder="항목 이름"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                    autoFocus
                    className="flex-1"
                  />
                  <button
                    onClick={handleAddItem}
                    className="px-3 py-1 text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors cursor-pointer text-sm font-medium"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => {
                      setAddingTo(null);
                      setNewItemName('');
                    }}
                    className="px-3 py-1 text-neutral-text-secondary hover:bg-neutral-gray-100 rounded transition-colors cursor-pointer text-sm font-medium"
                  >
                    취소
                  </button>
                </div>
              )}

              {/* Child Items */}
              {hasChildren && (
                <div>
                  {renderItemTree(item.id, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-heading-2 text-neutral-text-primary mb-4">
          {selectedDate.toLocaleString('ko-KR', { month: 'long', day: 'numeric' })}의 할일
        </h1>
      </div>

      {/* Categories and Items Tree */}
      <div className="flex flex-col gap-2">
        {categories.map((category) => {
          const categoryItems = getChildItems(category.id);
          const dateFilteredItems = categoryItems.filter(item => 
            item.date &&
            item.date.getFullYear() === selectedDate.getFullYear() &&
            item.date.getMonth() === selectedDate.getMonth() &&
            item.date.getDate() === selectedDate.getDate()
          );

          return (
            <div key={category.id}>
              {/* Category Header */}
              <div
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md
                  bg-neutral-gray-200 hover:bg-neutral-gray-300 transition-colors font-semibold
                `}
              >
                {/* Color Circle */}
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${category.color?.split(' ')[0]}`} />

                <span className={`flex-1 font-semibold ${category.color?.split(' ')[1]}`}>
                  {category.name}
                </span>

                {dateFilteredItems.length > 0 && (
                  <span className="text-xs text-neutral-text-secondary">
                    {dateFilteredItems.filter(i => i.completed).length}/{dateFilteredItems.length}
                  </span>
                )}

                {/* Add Item Button */}
                <button
                  onClick={() => setAddingTo(category.id)}
                  className="flex-shrink-0 p-1 hover:bg-neutral-gray-400 rounded transition-colors text-neutral-text-secondary hover:text-status-success"
                  title="할일 추가"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Category Content */}
              <div className="mt-2 flex flex-col gap-2">
                  {/* Add Item Input */}
                  {/* This block is now handled within renderItemTree */}

                  {/* Items */}
                  {dateFilteredItems.length === 0 && !addingTo ? null : renderItemTree(category.id)}
                </div>
            </div>
          );
        })}

        {/* Add Category Section */}
        <div className="mt-4 pt-4 border-t border-neutral-gray-300">
          {addingTo !== 'category-new' ? (
            <button
              onClick={() => {
                setAddingTo('category-new');
                setSelectedCategoryColor(colors[0]);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors cursor-pointer font-medium"
            >
              <Plus size={18} />
              <span>새 카테고리 추가</span>
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-3">
              {/* 카테고리 이름 입력 */}
              <div>
                <Input
                  type="text"
                  placeholder="새 카테고리 이름을 입력하세요"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  autoFocus
                  className="flex-1"
                />
              </div>

              {/* 색상 선택 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-text-tertiary font-medium">색상:</span>
                <div className="flex gap-2">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategoryColor(color)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        selectedCategoryColor === color
                          ? 'ring-2 ring-primary-500 scale-110'
                          : 'ring-1 ring-neutral-gray-300 hover:ring-neutral-gray-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    >
                      {selectedCategoryColor === color && (
                        <Check size={12} className="text-white font-bold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors cursor-pointer text-sm font-medium"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setAddingTo(null);
                    setNewItemName('');
                    setSelectedCategoryColor(colors[0]);
                  }}
                  className="px-3 py-2 text-neutral-text-secondary hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer text-sm font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
