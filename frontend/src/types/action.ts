import { Comment, Thread, User } from "./state";

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
  }


export type ThreadAction =
  | {
    type: "delete_thread";
    threadId: number;
  }
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
  }


export type CommentAction =
  | {
    type: "delete_comment";
    commentId: number;
  }
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
