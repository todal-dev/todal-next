import { MiniCalendar } from '@/components/layout/CalendarPlaceholder';
import { BigCalendar } from '@/components/layout/WeekCalendar';
import { TodoList } from '@/components/todo/TodoList';
import type { Todo, Category, RecurrenceRule } from '@/types/calendar';

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

interface DesktopLayoutProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  todosByDate: Record<string, TodoByDate>;
  todos: Todo[];
  categories: Category[];
  onAddTodo: (text: string, categoryId: string, date: Date, parentId?: string, startTime?: string, endTime?: string) => void;
  onDeleteTodo: (id: string) => void;
  onToggleTodo: (id: string) => void;
  onEditTodo: (id: string, text: string) => void;
  onUpdateTodoTime: (id: string, startTime?: string, endTime?: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onEditCategory: (id: string, name: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
  onMoveTodo: (todoId: string, newCategoryId: string, newParentId?: string, newIndex?: number) => void;
  onAddRecurring: (text: string, startTime: string, endTime: string, recurrenceRule: RecurrenceRule) => void;
  onEditRecurring: (id: string, text: string, startTime: string, endTime: string, recurrenceRule: RecurrenceRule) => void;
  onDeleteRecurring: (id: string) => void;
  onUpdateTodoDateTime: (id: string, date: Date, startTime?: string, endTime?: string) => void;
  onAddTodoFromCalendar: (todo: Omit<Todo, 'id'>, callback?: (id: string) => void) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onMoveTodoToDate: (id: string, newDate: Date) => void;
}

export function DesktopLayout({
  selectedDate,
  onDateSelect,
  todosByDate,
  todos,
  categories,
  onAddTodo,
  onDeleteTodo,
  onToggleTodo,
  onEditTodo,
  onUpdateTodoTime,
  onAddCategory,
  onEditCategory,
  onChangeColor,
  onDeleteCategory,
  onMoveTodo,
  onAddRecurring,
  onEditRecurring,
  onDeleteRecurring,
  onUpdateTodoDateTime,
  onAddTodoFromCalendar,
  onUpdateTodo,
  onMoveTodoToDate,
}: DesktopLayoutProps) {
  return (
    <div className="hidden md:flex w-full">
      {/* Left Panel - Mini Calendar + Todo List */}
      <div className="flex-[2] border-r border-neutral-gray-300 flex flex-col bg-white">
        {/* Mini Calendar */}
        <div className="shrink-0">
          <MiniCalendar onDateSelect={onDateSelect} todosByDate={todosByDate} />
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto border-t border-neutral-gray-300">
          <TodoList
            selectedDate={selectedDate}
            todos={todos}
            categories={categories}
            onAddTodo={onAddTodo}
            onDeleteTodo={onDeleteTodo}
            onToggleTodo={onToggleTodo}
            onEditTodo={onEditTodo}
            onUpdateTodoTime={onUpdateTodoTime}
            onAddCategory={onAddCategory}
            onEditCategory={onEditCategory}
            onChangeColor={onChangeColor}
            onDeleteCategory={onDeleteCategory}
            onMoveTodo={onMoveTodo}
            onAddRecurring={onAddRecurring}
            onEditRecurring={onEditRecurring}
            onDeleteRecurring={onDeleteRecurring}
          />
        </div>
      </div>

      {/* Right Panel - Big Calendar */}
      <div className="flex-[3] overflow-hidden flex flex-col">
        <BigCalendar
          selectedDate={selectedDate}
          todos={todos}
          categories={categories}
          onUpdateTodoDateTime={onUpdateTodoDateTime}
          onAddTodo={onAddTodoFromCalendar}
          onEditTodo={onUpdateTodo}
          onDeleteTodo={onDeleteTodo}
          onMoveTodo={onMoveTodoToDate}
        />
      </div>
    </div>
  );
}
