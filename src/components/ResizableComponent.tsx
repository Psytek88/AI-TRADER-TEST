import React from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import 'react-resizable/css/styles.css';

interface ResizableComponentProps {
  id: string;
  title: string;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  onResize: (id: string, size: { width: number; height: number }) => void;
  className?: string;
  children: React.ReactNode;
}

export function ResizableComponent({
  id,
  title,
  width,
  height,
  minWidth = 300,
  minHeight = 200,
  onResize,
  className = '',
  children
}: ResizableComponentProps) {
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
    width: '100%',
    height: '100%',
  };

  const handleResize = (
    _e: React.SyntheticEvent,
    { size }: ResizeCallbackData
  ) => {
    onResize(id, size);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ResizableBox
        width={width}
        height={height}
        minConstraints={[minWidth, minHeight]}
        onResize={handleResize}
        resizeHandles={['se']}
        className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${
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
      </ResizableBox>
    </div>
  );
}