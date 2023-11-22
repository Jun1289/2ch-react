import { ReactNode } from "react";

export type UserContextType = {
  userState: UserState;
  userDispatch: React.Dispatch<UserAction>;
  setToken: (token: string | undefined) => void;
} | null;

export type User = {
  name: string,
  hashedPassword: string,
  likes: string[],
  comments: number[],
  token: string,
  id: number
} | null

export type UserState = {
  user: User,
  isLoading: boolean,
  error: null | string,
}

export type Comment = {
  id: number,
  commentNo: number,
  commenter: string,
  commentContent: string,
  createdAt: string,
  threadId: number,
}

export type CommentsState = {
  comments: Comment[],
  isLoading: boolean,
  error: null | string,
}

export type Thread = {
  id: number,
  title: string,
  topic: string,
  createdAt: string,
  commentTotal: number,
  builder: string
}

export type ThreadsState = {
  threads: Thread[],
  isLoading: boolean,
  currentThread: null | Thread,
  error: null | string
}

export interface ThreadFormProps {
  threadsDispatch: React.Dispatch<ThreadAction>;
}

export interface CommentFormProps {
  commentDispatch: React.Dispatch<CommentAction>;
}

export interface UserProviderProps {
  children: ReactNode;
}

export type UserAction =
  | {
    type: "add_comment";
    newComment: number;
  }
  | {
    type: 'set_user';
    user: User | null;
  }
  | {
    type: "set_error";
    error: string | null;
  } | {
    type: "reset";
  }


export type ThreadAction =
  | {
    type: "add_thread";
    newThread: Thread;
  }
  | {
    type: "set_threads";
    threads: Thread[];
  }
  | {
    type: "set_thread";
    currentThread: Thread;
  }
  | {
    type: "set_error";
    error: string | null;
  } | {
    type: "reset";
  }


export type CommentAction =
  | {
    type: "add_comment";
    newComment: Comment;
  }
  | {
    type: "set_comments";
    comments: Comment[];
  }
  | {
    type: "set_error";
    error: string | null;
  }
