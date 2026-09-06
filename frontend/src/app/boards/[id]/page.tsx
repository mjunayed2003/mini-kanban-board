'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { Column, Task } from '@/lib/types';
import { ColumnContainer } from '@/components/ColumnContainer';
import { TaskCard } from '@/components/TaskCard';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchBoardDetails,
  addColumn,
  moveTask,
  setColumns,
} from '@/store/slices/boardSlice';

export default function BoardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { currentBoard, columns, loading: boardLoading } = useAppSelector((state) => state.boards);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [newColTitle, setNewColTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (id) {
      dispatch(fetchBoardDetails(id));
    }
  }, [user, authLoading, id, dispatch, router]);

  const findColumnOfTask = (taskId: string) =>
    columns.find((c) => c.tasks.some((t) => t.id === taskId));

  const handleDragStart = (event: DragStartEvent) => {
    const task = columns
      .flatMap((c) => c.tasks)
      .find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    if (activeTaskId === overId) return;

    const sourceColumn = findColumnOfTask(activeTaskId);
    if (!sourceColumn) return;

    const overColumn =
      columns.find((c) => c.id === overId) || findColumnOfTask(overId);
    if (!overColumn) return;

    const overTasks = overColumn.tasks.filter((t) => t.id !== activeTaskId);
    const overIndex = overTasks.findIndex((t) => t.id === overId);

    const beforeTask = overIndex > 0 ? overTasks[overIndex - 1] : null;
    const afterTask =
      overIndex >= 0 ? overTasks[overIndex] : overTasks[overTasks.length - 1] || null;

    const nextColumns: Column[] = columns.map((c) => ({
      ...c,
      tasks: [...c.tasks],
    }));
    const src = nextColumns.find((c) => c.id === sourceColumn.id)!;
    const dst = nextColumns.find((c) => c.id === overColumn.id)!;
    const taskIdx = src.tasks.findIndex((t) => t.id === activeTaskId);
    const [moved] = src.tasks.splice(taskIdx, 1);
    const insertAt = overIndex >= 0 ? overIndex : dst.tasks.length;
    dst.tasks.splice(insertAt, 0, { ...moved, columnId: overColumn.id });

    dispatch(setColumns(nextColumns));

    dispatch(
      moveTask({
        taskId: activeTaskId,
        targetColumnId: overColumn.id,
        beforeTaskId: beforeTask?.id,
        afterTaskId: afterTask?.id,
        boardId: id,
      })
    );
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    await dispatch(addColumn({ boardId: id, title: newColTitle.trim() }));
    setNewColTitle('');
  };



  if (authLoading || (!currentBoard && boardLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading board...
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="p-8 text-center text-gray-500">
        Board not found.{' '}
        <button onClick={() => router.push('/boards')} className="text-blue-600 underline">
          Return to boards
        </button>
      </div>
    );
  }

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div>
          <button
            onClick={() => router.push('/boards')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-1 transition"
          >
            ← Back to boards
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{currentBoard.title}</h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              Owner: {currentBoard.owner.name}
            </span>
          </div>
        </div>

      </header>

      {/* Kanban Board Board Area */}
      <main className="flex-1 p-6 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-4 pb-4">
            {sortedColumns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                boardId={id}
              />
            ))}

            {/* Add Column Button / Form */}
            <form onSubmit={handleAddColumn} className="flex-shrink-0 w-72">
              <div className="bg-white/80 hover:bg-white border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-3 transition">
                <input
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="+ Add new column..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newColTitle.trim() && (
                  <button
                    type="submit"
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-1.5 rounded-lg transition"
                  >
                    Add Column
                  </button>
                )}
              </div>
            </form>
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
