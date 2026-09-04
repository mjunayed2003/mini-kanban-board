'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { useAppDispatch } from '@/store';
import { addTask } from '@/store/slices/boardSlice';

interface Props {
  column: Column;
  boardId: string;
}

export function ColumnContainer({ column, boardId }: Props) {
  const dispatch = useAppDispatch();
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: 'column', column },
  });

  const taskIds = column.tasks.map((t) => t.id);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await dispatch(addTask({ columnId: column.id, title: newTitle.trim(), boardId }));
    setNewTitle('');
    setAdding(false);
  };

  return (
    <div className="bg-gray-100/90 border border-gray-200/80 rounded-xl p-3.5 w-76 flex-shrink-0 flex flex-col max-h-[calc(100vh-180px)]">
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="font-semibold text-sm text-gray-800 tracking-tight">{column.title}</h3>
        <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5 font-medium">
          {column.tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto min-h-[50px] pr-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      {adding ? (
        <form onSubmit={handleAddTask} className="mt-2.5">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => !newTitle && setAdding(false)}
            placeholder="Task title..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-200/70 rounded-lg p-2 mt-2 transition w-full text-left"
        >
          <span className="text-base leading-none">+</span> Add task
        </button>
      )}
    </div>
  );
}
