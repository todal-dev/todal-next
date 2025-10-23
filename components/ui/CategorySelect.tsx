'use client';

import { CustomSelect, SelectOption } from './CustomSelect';

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  className?: string;
}

export function CategorySelect({ categories, value, onChange, className = '' }: CategorySelectProps) {
  const options: SelectOption[] = categories.map(category => ({
    value: category.id,
    label: category.name,
    icon: (
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: category.color }}
      />
    )
  }));

  return (
    <CustomSelect
      options={options}
      value={value}
      onChange={onChange}
      className={className}
      placeholder="카테고리 선택"
    />
  );
}
