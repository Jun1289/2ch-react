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
  responder: string,
  commentContent: string,
  createdAt: string,
  updatedAt: string,
  threadId: number
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
  updatedAt: string,
  commentTotal: number,
  builder: string
}

export type ThreadsState = {
  threads: Thread[],
  isLoading: boolean,
  currentThread: null | Thread,
  error: null | string
}
