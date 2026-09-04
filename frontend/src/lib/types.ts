export interface User {
  id: string;
  email: string;
  name: string;
}

export interface BoardMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'MEMBER';
  user: User;
}

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  position: number;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  columns?: Column[];
}
