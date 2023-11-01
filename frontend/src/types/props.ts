import { ReactNode } from "react";
import { CommentAction, ThreadAction } from "./action";

export interface ThreadFormProps {
  onThreadCreated: React.Dispatch<ThreadAction>;
}

export interface CommentFormProps {
  commentDispatch: React.Dispatch<CommentAction>;
}

export interface UserProviderProps {
  children: ReactNode;
}
