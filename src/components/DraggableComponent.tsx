import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableComponentProps {
  id: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function DraggableComponent({ id, title, className = '', children }: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm ${
        isDragging ? 'opacity-50' : ''
      } ${className}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 p-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
      >
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>
      {children}
    </div>
  );
}