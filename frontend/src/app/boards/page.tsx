'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { logoutUser } from '@/store/slices/authSlice';
import { fetchBoards, createBoard } from '@/store/slices/boardSlice';

export default function BoardsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const { boards, loading: boardsLoading } = useAppSelector((state) => state.boards);

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      dispatch(fetchBoards());
    }
  }, [user, authLoading, dispatch, router]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await dispatch(createBoard(title.trim()));
    setTitle('');
    dispatch(fetchBoards());
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/login');
  };

  if (authLoading || (!user && boardsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
          {user && <p className="text-sm text-gray-500 mt-1">Logged in as {user.name} ({user.email})</p>}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded transition"
        >
          Log out
        </button>
      </div>

      <form onSubmit={handleCreateBoard} className="flex gap-2 mb-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New board title..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition shadow-sm"
        >
          Create Board
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            onClick={() => router.push(`/boards/${board.id}`)}
            className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-blue-400 transition"
          >
            <h2 className="font-semibold text-lg text-gray-800">{board.title}</h2>
            <p className="text-xs text-gray-500 mt-2">
              Owner: <span className="font-medium text-gray-700">{board.owner.name}</span>
              {board.members.length > 0 && (
                <span> · {board.members.length} member{board.members.length > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
        ))}
        {boards.length === 0 && !boardsLoading && (
          <div className="col-span-2 text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500">
            No boards yet — create one above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
