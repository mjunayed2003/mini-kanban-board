'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';

export function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { type: 'task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-xs cursor-grab active:cursor-grabbing hover:border-blue-400 transition select-none ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
    >
      <p className="font-medium text-sm text-gray-800 leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
}
