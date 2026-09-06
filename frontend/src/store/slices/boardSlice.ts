import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { Board, Column } from '@/lib/types';

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  columns: Column[];
  loading: boolean;
  error: string | null;
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  columns: [],
  loading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk('boards/fetchBoards', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/boards');
    return data as Board[];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch boards');
  }
});

export const createBoard = createAsyncThunk('boards/createBoard', async (title: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/boards', { title });
    return data as Board;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create board');
  }
});

export const fetchBoardDetails = createAsyncThunk(
  'boards/fetchBoardDetails',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/boards/${boardId}`);
      return data as Board;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch board details');
    }
  }
);

export const addColumn = createAsyncThunk(
  'boards/addColumn',
  async ({ boardId, title }: { boardId: string; title: string }, { dispatch, rejectWithValue }) => {
    try {
      await api.post('/columns', { boardId, title });
      dispatch(fetchBoardDetails(boardId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add column');
    }
  }
);

export const addTask = createAsyncThunk(
  'boards/addTask',
  async (
    { columnId, title, boardId }: { columnId: string; title: string; boardId: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await api.post('/tasks', { columnId, title });
      dispatch(fetchBoardDetails(boardId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'boards/moveTask',
  async (
    {
      taskId,
      targetColumnId,
      beforeTaskId,
      afterTaskId,
      boardId,
    }: {
      taskId: string;
      targetColumnId: string;
      beforeTaskId?: string;
      afterTaskId?: string;
      boardId: string;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await api.post(`/tasks/${taskId}/move`, {
        targetColumnId,
        beforeTaskId,
        afterTaskId,
      });
    } catch (err: any) {
      // Re-fetch fresh board data on failure to rollback optimistic update
      dispatch(fetchBoardDetails(boardId));
      return rejectWithValue(err.response?.data?.message || 'Failed to move task');
    }
  }
);

export const addBoardMember = createAsyncThunk(
  'boards/addMember',
  async ({ boardId, email }: { boardId: string; email: string }, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/boards/${boardId}/members`, { email });
      await dispatch(fetchBoardDetails(boardId));
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add member');
    }
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setColumns(state, action: PayloadAction<Column[]>) {
      state.columns = action.payload;
    },
    clearCurrentBoard(state) {
      state.currentBoard = null;
      state.columns = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBoards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load boards';
      })
      // fetchBoardDetails
      .addCase(fetchBoardDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
        state.columns = action.payload.columns || [];
      })
      .addCase(fetchBoardDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to load board';
      });
  },
});

export const { setColumns, clearCurrentBoard } = boardSlice.actions;
export default boardSlice.reducer;
