'use client';

import { useState, useMemo } from 'react';
import { MiniCalendar } from '@/components/layout/CalendarPlaceholder';
import { BigCalendar } from '@/components/layout/Header';
import { TodoList } from '@/components/todo/TodoList';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  categoryId: string;
  subtasks?: Todo[];
  parentId?: string;
  startTime?: string; // 'HH:mm' 형식
  endTime?: string; // 'HH:mm' 형식
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface TodoByDateCategory {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  completed: number;
}

interface TodoByDate {
  completed: number;
  total: number;
  byCategory: TodoByDateCategory[];
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'todo' | 'calendar'>('todo');

  // 카테고리 (기타 카테고리는 항상 존재하고 맨 하단에 위치)
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat1', name: '업무', color: '#3B82F6' },
    { id: 'cat2', name: '개인', color: '#A855F7' },
    { id: 'cat3', name: '학습', color: '#2D9F6B' },
    { id: 'cat-etc', name: '기타', color: '#9CA3AF' },
  ]);

  // 샘플 투두 데이터 (하위 할일 예시 포함)
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      text: '프로젝트 기획',
      completed: false,
      date: new Date(2025, 9, 14),
      categoryId: 'cat1',
      startTime: '09:00',
      endTime: '11:00',
      subtasks: [
        { id: '1-1', text: '요구사항 정리', completed: true, date: new Date(2025, 9, 14), categoryId: 'cat1', subtasks: [] },
        { id: '1-2', text: '일정 계획', completed: false, date: new Date(2025, 9, 14), categoryId: 'cat1', subtasks: [] },
      ]
    },
    { id: '2', text: '디자인 시스템', completed: true, date: new Date(2025, 9, 14), categoryId: 'cat3', startTime: '14:00', endTime: '16:00', subtasks: [] },
    {
      id: '3',
      text: '프론트엔드 개발',
      completed: false,
      date: new Date(2025, 9, 15),
      categoryId: 'cat1',
      startTime: '10:00',
      endTime: '13:00',
      subtasks: [
        { id: '3-1', text: '컴포넌트 구조 설계', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1', subtasks: [] },
        { id: '3-2', text: 'UI 구현', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1', subtasks: [] },
      ]
    },
    { id: '4', text: 'API 연동', completed: false, date: new Date(2025, 9, 15), categoryId: 'cat1', startTime: '14:00', endTime: '17:00', subtasks: [] },
    { id: '5', text: '테스트', completed: true, date: new Date(2025, 9, 15), categoryId: 'cat3', subtasks: [] },
    { id: '6', text: '배포 준비', completed: false, date: new Date(2025, 9, 16), categoryId: 'cat1', subtasks: [] },
    { id: '7', text: '문서 작성', completed: true, date: new Date(2025, 9, 17), categoryId: 'cat2', subtasks: [] },
    { id: '8', text: '회의', completed: false, date: new Date(2025, 9, 17), categoryId: 'cat1', startTime: '15:00', endTime: '16:00', subtasks: [] },
  ]);

  // 날짜별 투두 그룹화 (카테고리별, 최상위 할일만 카운트)
  const todosByDate = useMemo(() => {
    const grouped: Record<string, TodoByDate> = {};
    
    // 최상위 할일만 처리 (하위 할일은 카운트하지 않음)
    todos.forEach((todo) => {
      const year = todo.date.getFullYear();
      const month = String(todo.date.getMonth() + 1).padStart(2, '0');
      const day = String(todo.date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = { completed: 0, total: 0, byCategory: [] };
      }
      
      grouped[dateKey].total += 1;
      if (todo.completed) {
        grouped[dateKey].completed += 1;
      }

      // 카테고리별 정보 추가
      const category = categories.find(c => c.id === todo.categoryId);
      if (category) {
        const existingCat = grouped[dateKey].byCategory.find(c => c.categoryId === todo.categoryId);
        if (existingCat) {
          existingCat.total += 1;
          if (todo.completed) existingCat.completed += 1;
        } else {
          grouped[dateKey].byCategory.push({
            categoryId: todo.categoryId,
            name: category.name,
            color: category.color,
            total: 1,
            completed: todo.completed ? 1 : 0,
          });
        }
      }
    });

    return grouped;
  }, [todos, categories]);

  // 할일 추가
  const handleAddTodo = (text: string, categoryId: string, date: Date, parentId?: string, startTime?: string, endTime?: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      date,
      categoryId,
      parentId,
      subtasks: [],
      startTime,
      endTime,
    };

    if (parentId) {
      // 하위 할일 추가: 부모 할일을 찾아서 subtasks에 추가
      const addSubtaskRecursively = (todoList: Todo[]): Todo[] => {
        return todoList.map(todo => {
          if (todo.id === parentId) {
            return {
              ...todo,
              subtasks: [...(todo.subtasks || []), newTodo],
            };
          }
          if (todo.subtasks && todo.subtasks.length > 0) {
            return {
              ...todo,
              subtasks: addSubtaskRecursively(todo.subtasks),
            };
          }
          return todo;
        });
      };
      setTodos(addSubtaskRecursively(todos));
    } else {
      // 최상위 할일 추가
      setTodos([...todos, newTodo]);
    }
  };

  // 할일 삭제 (재귀적으로 하위 할일도 포함)
  const handleDeleteTodo = (id: string) => {
    const deleteRecursively = (todoList: Todo[]): Todo[] => {
      return todoList
        .filter(todo => todo.id !== id)
        .map(todo => ({
          ...todo,
          subtasks: todo.subtasks ? deleteRecursively(todo.subtasks) : undefined,
        }));
    };
    setTodos(deleteRecursively(todos));
  };

  // 할일 완료 토글 (하위 할일도 함께 토글, 상위 할일 자동 업데이트)
  const handleToggleTodo = (id: string) => {
    // 모든 하위 할일을 같은 상태로 변경하는 함수
    const toggleAllSubtasks = (subtasks: Todo[] | undefined, completed: boolean): Todo[] | undefined => {
      if (!subtasks) return undefined;
      return subtasks.map(subtask => ({
        ...subtask,
        completed,
        subtasks: toggleAllSubtasks(subtask.subtasks, completed),
      }));
    };

    // 하위 할일 상태에 따라 상위 할일 상태 업데이트
    const updateParentStatus = (todo: Todo): Todo => {
      if (!todo.subtasks || todo.subtasks.length === 0) {
        return todo;
      }

      // 먼저 모든 하위 할일의 상태를 업데이트
      const updatedSubtasks = todo.subtasks.map(updateParentStatus);
      
      // 모든 하위 할일이 완료되었는지 확인
      const allSubtasksCompleted = updatedSubtasks.every(subtask => subtask.completed);
      
      return {
        ...todo,
        subtasks: updatedSubtasks,
        completed: allSubtasksCompleted,
      };
    };

    const toggleRecursively = (todoList: Todo[]): Todo[] => {
      return todoList.map(todo => {
        if (todo.id === id) {
          const newCompletedState = !todo.completed;
          return {
            ...todo,
            completed: newCompletedState,
            subtasks: toggleAllSubtasks(todo.subtasks, newCompletedState),
          };
        }
        if (todo.subtasks && todo.subtasks.length > 0) {
          const updatedTodo = {
            ...todo,
            subtasks: toggleRecursively(todo.subtasks),
          };
          // 하위 할일 상태에 따라 상위 할일 상태 업데이트
          return updateParentStatus(updatedTodo);
        }
        return todo;
      });
    };
    
    setTodos(toggleRecursively(todos));
  };

  // 할일 수정 (재귀적으로 하위 할일 검색)
  const handleEditTodo = (id: string, text: string) => {
    const editRecursively = (todoList: Todo[]): Todo[] => {
      return todoList.map(todo => {
        if (todo.id === id) {
          return { ...todo, text };
        }
        if (todo.subtasks && todo.subtasks.length > 0) {
          return {
            ...todo,
            subtasks: editRecursively(todo.subtasks),
          };
        }
        return todo;
      });
    };
    setTodos(editRecursively(todos));
  };

  // 할일 시간 업데이트
  const handleUpdateTodoTime = (id: string, startTime?: string, endTime?: string) => {
    const updateTimeRecursively = (todoList: Todo[]): Todo[] => {
      return todoList.map(todo => {
        if (todo.id === id) {
          return { ...todo, startTime, endTime };
        }
        if (todo.subtasks && todo.subtasks.length > 0) {
          return {
            ...todo,
            subtasks: updateTimeRecursively(todo.subtasks),
          };
        }
        return todo;
      });
    };
    setTodos(updateTimeRecursively(todos));
  };

  // 카테고리 추가
  const handleAddCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      color,
    };
    setCategories([...categories, newCategory]);
  };

  // 카테고리 이름 수정
  const handleEditCategory = (id: string, name: string) => {
    // 기타 카테고리는 이름 수정 불가
    if (id === 'cat-etc') {
      return;
    }
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, name } : cat
    ));
  };

  // 카테고리 색상 변경
  const handleChangeColor = (id: string, color: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, color } : cat
    ));
  };

  // 카테고리 삭제
  const handleDeleteCategory = (id: string) => {
    // 기타 카테고리는 삭제 불가
    if (id === 'cat-etc') {
      alert('기타 카테고리는 삭제할 수 없습니다.');
      return;
    }

    // 해당 카테고리의 할일이 있는지 확인
    const hasTodos = todos.some(todo => todo.categoryId === id);
    if (hasTodos) {
      if (!confirm('이 카테고리에 할일이 있습니다. 정말 삭제하시겠습니까?')) {
        return;
      }
      // 카테고리의 할일도 모두 삭제
      setTodos(todos.filter(todo => todo.categoryId !== id));
    }
    setCategories(categories.filter(cat => cat.id !== id));
  };

  // 할일 이동 (드래그앤드롭)
  const handleMoveTodo = (todoId: string, newCategoryId: string, newParentId?: string, newIndex?: number) => {
    // 1. 이동할 todo 찾기
    let movedTodo: Todo | null = null;

    const findAndRemoveTodo = (todoList: Todo[]): Todo[] => {
      return todoList.filter(todo => {
        if (todo.id === todoId) {
          movedTodo = { ...todo, categoryId: newCategoryId, parentId: newParentId };
          return false;
        }
        if (todo.subtasks && todo.subtasks.length > 0) {
          todo.subtasks = findAndRemoveTodo(todo.subtasks);
        }
        return true;
      });
    };

    // 2. todo 제거
    let newTodos = findAndRemoveTodo([...todos]);

    if (!movedTodo) return;

    // 3. 새 위치에 삽입
    if (newParentId) {
      // 하위 할일로 이동
      const addToParent = (todoList: Todo[]): Todo[] => {
        return todoList.map(todo => {
          if (todo.id === newParentId) {
            const subtasks = todo.subtasks || [];
            const insertIndex = newIndex !== undefined ? Math.min(newIndex, subtasks.length) : subtasks.length;
            return {
              ...todo,
              subtasks: [
                ...subtasks.slice(0, insertIndex),
                movedTodo!,
                ...subtasks.slice(insertIndex),
              ],
            };
          }
          if (todo.subtasks && todo.subtasks.length > 0) {
            return {
              ...todo,
              subtasks: addToParent(todo.subtasks),
            };
          }
          return todo;
        });
      };
      newTodos = addToParent(newTodos);
    } else {
      // 최상위 할일로 이동
      const insertIndex = newIndex !== undefined ? Math.min(newIndex, newTodos.length) : newTodos.length;
      newTodos = [
        ...newTodos.slice(0, insertIndex),
        movedTodo,
        ...newTodos.slice(insertIndex),
      ];
    }

    setTodos(newTodos);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-gray-300 bg-white h-12 px-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-text-primary">Todal</h1>
        <div className="flex gap-2">
          {/* 설정/프로필 버튼은 나중에 추가 */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: 좌우 분할 */}
        <div className="hidden md:flex w-full">
          {/* Left Panel - Mini Calendar + Todo List */}
          <div className="flex-[2] border-r border-neutral-gray-300 flex flex-col bg-white">
            {/* Mini Calendar */}
            <div className="shrink-0">
              <MiniCalendar onDateSelect={setSelectedDate} todosByDate={todosByDate} />
            </div>

            {/* Todo List */}
            <div className="flex-1 overflow-y-auto border-t border-neutral-gray-300">
              <TodoList
                selectedDate={selectedDate}
                todos={todos}
                categories={categories}
                onAddTodo={handleAddTodo}
                onDeleteTodo={handleDeleteTodo}
                onToggleTodo={handleToggleTodo}
                onEditTodo={handleEditTodo}
                onUpdateTodoTime={handleUpdateTodoTime}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onChangeColor={handleChangeColor}
                onDeleteCategory={handleDeleteCategory}
                onMoveTodo={handleMoveTodo}
              />
            </div>
          </div>

          {/* Right Panel - Big Calendar */}
          <div className="flex-[3] overflow-hidden flex flex-col">
            <BigCalendar
              selectedDate={selectedDate}
              todos={todos}
              categories={categories}
              onUpdateTodoDateTime={(id, date, startTime, endTime) => {
                // Update date
                const updateDateRecursively = (todoList: Todo[]): Todo[] => {
                  return todoList.map(todo => {
                    if (todo.id === id) {
                      return { ...todo, date, startTime, endTime };
                    }
                    if (todo.subtasks && todo.subtasks.length > 0) {
                      return {
                        ...todo,
                        subtasks: updateDateRecursively(todo.subtasks),
                      };
                    }
                    return todo;
                  });
                };
                setTodos(updateDateRecursively(todos));
              }}
              onAddTodo={(todo, callback) => {
                const newTodo: Todo = {
                  ...todo,
                  id: Date.now().toString(),
                  subtasks: [],
                };
                setTodos([...todos, newTodo]);
                // Call the callback with the new todo's id if provided
                callback?.(newTodo.id);
              }}
              onEditTodo={(id, updates) => {
                const editRecursively = (todoList: Todo[]): Todo[] => {
                  return todoList.map(todo => {
                    if (todo.id === id) {
                      return { ...todo, ...updates };
                    }
                    if (todo.subtasks && todo.subtasks.length > 0) {
                      return {
                        ...todo,
                        subtasks: editRecursively(todo.subtasks),
                      };
                    }
                    return todo;
                  });
                };
                setTodos(editRecursively(todos));
              }}
              onDeleteTodo={handleDeleteTodo}
              onMoveTodo={(id, newDate) => {
                const updateDateRecursively = (todoList: Todo[]): Todo[] => {
                  return todoList.map(todo => {
                    if (todo.id === id) {
                      return { ...todo, date: newDate };
                    }
                    if (todo.subtasks && todo.subtasks.length > 0) {
                      return {
                        ...todo,
                        subtasks: updateDateRecursively(todo.subtasks),
                      };
                    }
                    return todo;
                  });
                };
                setTodos(updateDateRecursively(todos));
              }}
            />
          </div>
        </div>

        {/* Mobile/Tablet: Tab Navigation */}
        <div className="md:hidden w-full flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-neutral-gray-300">
            <button
              onClick={() => setActiveTab('todo')}
              className={`
                flex-1 px-4 py-3 text-center font-medium transition-colors
                border-b-2
                ${
                  activeTab === 'todo'
                    ? 'border-b-primary-500 text-primary-500'
                    : 'border-b-transparent text-neutral-text-secondary hover:text-neutral-text-primary'
                }
              `}
            >
              할일
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`
                flex-1 px-4 py-3 text-center font-medium transition-colors
                border-b-2
                ${
                  activeTab === 'calendar'
                    ? 'border-b-primary-500 text-primary-500'
                    : 'border-b-transparent text-neutral-text-secondary hover:text-neutral-text-primary'
                }
              `}
            >
              캘린더
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'todo' ? (
              <div className="flex flex-col h-full">
                <div className="shrink-0">
                  <MiniCalendar onDateSelect={setSelectedDate} todosByDate={todosByDate} />
                </div>
                <div className="flex-1 overflow-y-auto border-t border-neutral-gray-300">
                  <TodoList
                    selectedDate={selectedDate}
                    todos={todos}
                    categories={categories}
                    onAddTodo={handleAddTodo}
                    onDeleteTodo={handleDeleteTodo}
                    onToggleTodo={handleToggleTodo}
                    onEditTodo={handleEditTodo}
                    onUpdateTodoTime={handleUpdateTodoTime}
                    onAddCategory={handleAddCategory}
                    onEditCategory={handleEditCategory}
                    onChangeColor={handleChangeColor}
                    onDeleteCategory={handleDeleteCategory}
                    onMoveTodo={handleMoveTodo}
                  />
                </div>
              </div>
            ) : (
              <BigCalendar
                selectedDate={selectedDate}
                todos={todos}
                categories={categories}
                onUpdateTodoDateTime={(id, date, startTime, endTime) => {
                  // Update date
                  const updateDateRecursively = (todoList: Todo[]): Todo[] => {
                    return todoList.map(todo => {
                      if (todo.id === id) {
                        return { ...todo, date, startTime, endTime };
                      }
                      if (todo.subtasks && todo.subtasks.length > 0) {
                        return {
                          ...todo,
                          subtasks: updateDateRecursively(todo.subtasks),
                        };
                      }
                      return todo;
                    });
                  };
                  setTodos(updateDateRecursively(todos));
                }}
                onAddTodo={(todo, callback) => {
                  const newTodo: Todo = {
                    ...todo,
                    id: Date.now().toString(),
                    subtasks: [],
                  };
                  setTodos([...todos, newTodo]);
                  // Call the callback with the new todo's id if provided
                  callback?.(newTodo.id);
                }}
                onEditTodo={(id, updates) => {
                  const editRecursively = (todoList: Todo[]): Todo[] => {
                    return todoList.map(todo => {
                      if (todo.id === id) {
                        return { ...todo, ...updates };
                      }
                      if (todo.subtasks && todo.subtasks.length > 0) {
                        return {
                          ...todo,
                          subtasks: editRecursively(todo.subtasks),
                        };
                      }
                      return todo;
                    });
                  };
                  setTodos(editRecursively(todos));
                }}
                onDeleteTodo={handleDeleteTodo}
                onMoveTodo={(id, newDate) => {
                  const updateDateRecursively = (todoList: Todo[]): Todo[] => {
                    return todoList.map(todo => {
                      if (todo.id === id) {
                        return { ...todo, date: newDate };
                      }
                      if (todo.subtasks && todo.subtasks.length > 0) {
                        return {
                          ...todo,
                          subtasks: updateDateRecursively(todo.subtasks),
                        };
                      }
                      return todo;
                    });
                  };
                  setTodos(updateDateRecursively(todos));
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
