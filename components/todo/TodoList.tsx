'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Trash2, ChevronRight, ChevronDown, Plus } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  categoryId: string;
  subtasks?: Todo[];
  parentId?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TodoListProps {
  selectedDate?: Date;
  todos: Todo[];
  categories: Category[];
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, text: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

export function TodoList({ 
  selectedDate = new Date(), 
  todos,
  categories,
  onAddTodo,
  onDeleteTodo,
  onToggleTodo,
  onEditTodo: _onEditTodo,
  onAddCategory,
  onEditCategory,
  onChangeColor,
  onDeleteCategory,
}: TodoListProps) {
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);
  const [addingSubtaskToId, setAddingSubtaskToId] = useState<string | null>(null);
  const [addingNewCategory, setAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [colorPickerCategoryId, setColorPickerCategoryId] = useState<string | null>(null);

  // 색상 팔레트
  const colorPalette = [
    '#3B82F6', // 파랑
    '#A855F7', // 보라
    '#2D9F6B', // 초록
    '#EF4444', // 빨강
    '#F59E0B', // 주황
    '#10B981', // 에메랄드
    '#8B5CF6', // 바이올렛
    '#EC4899', // 핑크
    '#06B6D4', // 시안
    '#84CC16', // 라임
  ];

  // 하위 할일이 있는 항목은 자동으로 확장
  useEffect(() => {
    const newExpanded = new Set<string>();
    const expandAllWithSubtasks = (todoList: Todo[]) => {
      todoList.forEach(todo => {
        if (todo.subtasks && todo.subtasks.length > 0) {
          newExpanded.add(todo.id);
          expandAllWithSubtasks(todo.subtasks);
        }
      });
    };
    expandAllWithSubtasks(todos);
    setExpandedTodos(newExpanded);
  }, [todos]);

  // 외부 클릭 시 색상 선택 팔레트 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (colorPickerCategoryId && !target.closest('.color-picker-container')) {
        setColorPickerCategoryId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorPickerCategoryId]);

  // 선택된 날짜의 할일만 필터링
  const filteredTodos = todos.filter(todo => {
    return todo.date.getFullYear() === selectedDate.getFullYear() &&
           todo.date.getMonth() === selectedDate.getMonth() &&
           todo.date.getDate() === selectedDate.getDate();
  });

  // 카테고리별로 그룹화
  const todosByCategory = categories.map(cat => ({
    ...cat,
    items: filteredTodos.filter(todo => todo.categoryId === cat.id),
  }));

  const toggleExpanded = (todoId: string) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(todoId)) {
      newExpanded.delete(todoId);
    } else {
      newExpanded.add(todoId);
    }
    setExpandedTodos(newExpanded);
  };

  // 노션 스타일 입력 칸 렌더링
  const renderNewTodoInput = (categoryId: string, parentId?: string, level: number = 0) => {
    const isActive = parentId ? addingSubtaskToId === parentId : addingToCategoryId === categoryId;
    
    if (!isActive) return null;
    
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-gray-50 transition-all"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="w-5" />
        <div className="w-4 h-4 flex-shrink-0" />
        
        <input
          ref={(el) => {
            if (el) el.focus();
          }}
          type="text"
          placeholder="할일 입력..."
          className="flex-1 text-sm bg-transparent text-neutral-text-primary placeholder:text-neutral-text-tertiary focus:outline-none border-0 focus:ring-0"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = e.currentTarget.value.trim();
              if (value) {
                const inputElement = e.currentTarget; // 참조 저장
                onAddTodo(value, categoryId, selectedDate, parentId);
                inputElement.value = '';
                // 포커스 유지
                setTimeout(() => {
                  if (inputElement) {
                    inputElement.focus();
                  }
                }, 0);
              }
            } else if (e.key === 'Escape') {
              if (parentId) {
                setAddingSubtaskToId(null);
              } else {
                setAddingToCategoryId(null);
              }
            }
          }}
          onBlur={(e) => {
            // relatedTarget이 버튼이 아닐 때만 닫기
            const relatedTarget = e.relatedTarget as HTMLElement;
            const isClickingButton = relatedTarget?.tagName === 'BUTTON' || relatedTarget?.closest('button');
            
            if (!isClickingButton) {
              setTimeout(() => {
                if (parentId) {
                  setAddingSubtaskToId(null);
                } else {
                  setAddingToCategoryId(null);
                }
              }, 150);
            }
          }}
        />
      </div>
    );
  };

  // 재귀적 할일 렌더링 함수
  const renderTodoItem = (todo: Todo, level: number = 0, categoryId: string, index: number, siblings: Todo[]) => {
    const hasSubtasks = todo.subtasks && todo.subtasks.length > 0;
    const isExpanded = expandedTodos.has(todo.id);

    return (
      <div key={todo.id}>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-gray-100 transition-all group"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasSubtasks ? (
            <button
              onClick={() => toggleExpanded(todo.id)}
              className="flex-shrink-0 p-0.5 hover:bg-neutral-gray-200 rounded transition-colors text-neutral-text-secondary"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-5" />
          )}

          <Checkbox
            checked={todo.completed}
            onChange={() => onToggleTodo(todo.id)}
            className="flex-shrink-0"
          />

          <input
            type="text"
            defaultValue={todo.text}
            className={`flex-1 text-sm bg-transparent focus:outline-none border-0 focus:ring-0 ${
              todo.completed
                ? 'line-through text-neutral-text-secondary'
                : 'text-neutral-text-primary'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
                e.preventDefault();
                onDeleteTodo(todo.id);
                // 이전 항목으로 포커스 이동
                if (index > 0) {
                  const prevTodo = siblings[index - 1];
                  setTimeout(() => {
                    const inputs = document.querySelectorAll('input[type="text"]');
                    inputs.forEach((input) => {
                      if ((input as HTMLInputElement).defaultValue === prevTodo.text) {
                        (input as HTMLInputElement).focus();
                      }
                    });
                  }, 0);
                }
              }
            }}
            onBlur={(e) => {
              const newText = e.currentTarget.value.trim();
              if (newText && newText !== todo.text) {
                _onEditTodo(todo.id, newText);
              } else if (!newText) {
                onDeleteTodo(todo.id);
              }
            }}
          />

          {/* Add Subtask Button */}
          <button
            onMouseDown={(e) => {
              e.preventDefault(); // blur 방지
            }}
            onClick={() => {
              setAddingSubtaskToId(todo.id);
              // 하위 할일 추가 시 자동으로 확장
              if (!isExpanded && hasSubtasks) {
                toggleExpanded(todo.id);
              }
            }}
            className="flex-shrink-0 p-1 hover:bg-neutral-gray-200 rounded transition-colors text-neutral-text-secondary hover:text-primary-500 opacity-0 group-hover:opacity-100"
            title="하위 할일 추가"
          >
            <Plus size={14} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDeleteTodo(todo.id)}
            className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors text-neutral-text-secondary hover:text-red-600 opacity-0 group-hover:opacity-100"
            title="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Subtasks - 확장된 경우 또는 하위 할일 추가 중인 경우 표시 */}
        {(isExpanded || addingSubtaskToId === todo.id) && (
          <div className="mt-1">
            {hasSubtasks && todo.subtasks!.map((subtask, idx) => renderTodoItem(subtask, level + 1, categoryId, idx, todo.subtasks!))}
            {/* 하위 할일 추가 입력 */}
            {renderNewTodoInput(categoryId, todo.id, level + 1)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-5 h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-neutral-text-primary">
          {selectedDate.toLocaleString('ko-KR', { month: 'long', day: 'numeric' })}의 할일
        </h1>
      </div>

      {/* Categories and Todos */}
      <div className="flex flex-col gap-4">
        {todosByCategory.map((category) => (
          <div key={category.id}>
            {/* Category Header */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-gray-100 group relative">
              {/* Color Circle */}
              <div className="relative color-picker-container">
                <button
                  onClick={() => setColorPickerCategoryId(
                    colorPickerCategoryId === category.id ? null : category.id
                  )}
                  className="flex-shrink-0 w-4 h-4 rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-neutral-gray-400 transition-all cursor-pointer"
                  style={{ backgroundColor: category.color }}
                  title="색상 변경"
                />

                {/* Color Picker Dropdown */}
                {colorPickerCategoryId === category.id && (
                  <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-neutral-gray-300 rounded-lg shadow-lg z-50 min-w-[240px]">
                    <div className="grid grid-cols-5 gap-4">
                      {colorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            onChangeColor(category.id, color);
                            setColorPickerCategoryId(null);
                          }}
                          className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${
                            category.color === color ? 'ring-2 ring-offset-2 ring-neutral-gray-500' : ''
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Editable Category Name */}
              <input
                type="text"
                defaultValue={category.name}
                className="flex-1 font-semibold text-sm bg-transparent text-neutral-text-primary focus:outline-none border-0 focus:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                onBlur={(e) => {
                  const newName = e.currentTarget.value.trim();
                  if (newName && newName !== category.name) {
                    onEditCategory(category.id, newName);
                  } else if (!newName) {
                    e.currentTarget.value = category.name;
                  }
                }}
              />

              {category.items.length > 0 && (
                <span className="text-xs text-neutral-text-secondary">
                  {category.items.filter(t => t.completed).length}/{category.items.length}
                </span>
              )}

              {/* Add Todo Button */}
              <button
                onMouseDown={(e) => {
                  e.preventDefault(); // blur 방지
                }}
                onClick={() => setAddingToCategoryId(category.id)}
                className="flex-shrink-0 p-1 hover:bg-neutral-gray-300 rounded transition-colors text-neutral-text-secondary hover:text-primary-500"
                title="할일 추가"
              >
                <Plus size={16} />
              </button>

              {/* Delete Category Button */}
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors text-neutral-text-secondary hover:text-red-600 opacity-0 group-hover:opacity-100"
                title="카테고리 삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Todo Items */}
            <div className="mt-2 flex flex-col gap-1 ml-2">
              {category.items.map((todo, idx) => renderTodoItem(todo, 0, category.id, idx, category.items))}
              
              {/* 새 할일 입력 칸 (+ 버튼 클릭 시) */}
              {renderNewTodoInput(category.id)}
            </div>
          </div>
        ))}

        {/* Add New Category */}
        {addingNewCategory ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-gray-100">
            {/* Color Picker for New Category */}
            <div className="relative color-picker-container">
              <button
                onClick={() => setColorPickerCategoryId(
                  colorPickerCategoryId === 'new-category' ? null : 'new-category'
                )}
                className="flex-shrink-0 w-4 h-4 rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-neutral-gray-400 transition-all cursor-pointer"
                style={{ backgroundColor: newCategoryColor }}
                title="색상 선택"
              />

              {/* Color Picker Dropdown */}
              {colorPickerCategoryId === 'new-category' && (
                <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-neutral-gray-300 rounded-lg shadow-lg z-50 min-w-[240px]">
                  <div className="grid grid-cols-5 gap-4">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setNewCategoryColor(color);
                          setColorPickerCategoryId(null);
                        }}
                        className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${
                          newCategoryColor === color ? 'ring-2 ring-offset-2 ring-neutral-gray-500' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input
              ref={(el) => el?.focus()}
              type="text"
              placeholder="카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = newCategoryName.trim();
                  if (name) {
                    onAddCategory(name, newCategoryColor);
                    setNewCategoryName('');
                    setNewCategoryColor('#3B82F6');
                    setAddingNewCategory(false);
                  }
                } else if (e.key === 'Escape') {
                  setNewCategoryName('');
                  setNewCategoryColor('#3B82F6');
                  setAddingNewCategory(false);
                }
              }}
              onBlur={(e) => {
                // 색상 선택 버튼을 클릭한 경우 닫지 않음
                const relatedTarget = e.relatedTarget as HTMLElement;
                const isClickingColorPicker = relatedTarget?.closest('.color-picker-container');

                if (!isClickingColorPicker) {
                  setTimeout(() => {
                    setNewCategoryName('');
                    setNewCategoryColor('#3B82F6');
                    setAddingNewCategory(false);
                  }, 150);
                }
              }}
              className="flex-1 font-semibold text-sm bg-transparent text-neutral-text-primary focus:outline-none border-0 focus:ring-0"
            />
          </div>
        ) : (
          <button
            onClick={() => setAddingNewCategory(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-neutral-gray-100 transition-colors text-neutral-text-secondary hover:text-primary-500"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">카테고리 추가</span>
          </button>
        )}
      </div>
    </div>
  );
}
