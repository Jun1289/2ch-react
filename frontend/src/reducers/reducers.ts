import { CommentAction, ThreadAction, UserAction } from "../types/types";
import { CommentsState, ThreadsState, UserState } from "../types/types";

const initialize = <T extends UserState | CommentsState | ThreadsState>(initialState: T): T => {
  return {
    ...initialState,
    isLoading: false
  }
}

export const userInitialState: UserState = {
  user: null,
  isLoading: true,
  error: null
}

export const userReducer = (userState: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'add_comment':
      if (userState.user === null) return userState
      return {
        user: {
          ...(userState.user),
          comments: [...(userState.user.comments), action.newComment]
        },
        isLoading: false,
        error: null
      }
      break;
    case 'delete_comment': {
      if (userState.user === null) return userState
      const newCommentsData = userState.user.comments?.filter((comment) => {
        return comment !== action.commentId
      }) || null;
      return {
        user: {
          ...userState.user,
          comments: newCommentsData
        },
        isLoading: false,
        error: null
      }
      break;
    }
    case 'set_user':
      return {
        user: action.user,
        isLoading: false,
        error: null
      }
      break;
    case 'set_error':
      return {
        ...userState,
        isLoading: false,
        error: action.error
      }
      break;
    case 'reset':
      return initialize(userInitialState);
      break;
    default:
      return userState;

  }
}

export const commentsInitialState: CommentsState = {
  comments: [],
  isLoading: true,
  error: null
}

export const commentReducer = (commentsState: CommentsState, action: CommentAction) => {
  switch (action.type) {
    case 'delete_comment': {
      const newCommentsData = commentsState.comments?.filter((comment) => {
        return comment.id !== action.commentId
      }) || null;
      return {
        ...commentsState,
        comments: newCommentsData,
        isLoading: false,
        error: null
      }
      break;
    }
    case 'add_comment':
      return {
        ...commentsState,
        comments: [...commentsState.comments, action.newComment],
        isLoading: false,
        error: null
      }
      break;
    case 'set_comments':
      return {
        ...commentsState,
        comments: action.comments,
        isLoading: false,
        error: null
      }
      break;
    case 'set_error':
      return {
        ...commentsState,
        isLoading: false,
        error: action.error
      }
      break;
    case 'reset':
      return initialize(commentsInitialState);
      break;
  }
}

export const threadsInitialState: ThreadsState = {
  threads: [],
  isLoading: true,
  currentThread: null,
  error: null
}


export const threadReducer = (threadsState: ThreadsState, action: ThreadAction) => {
  switch (action.type) {
    case 'delete_thread': {
      const newthreadsData = threadsState.threads?.filter((thread) => {
        return thread.id !== action.threadId
      }) || null;
      return {
        ...threadsState,
        threads: newthreadsData,
        isLoaing: false,
        error: null
      }
      break;
    }
    case 'add_thread':
      return {
        ...threadsState,
        threads: [...threadsState.threads, action.newThread],
        isLoading: false,
        error: null
      }
      break;
    case 'set_threads':
      return {
        ...threadsState,
        threads: action.threads,
        isLoading: false,
        error: null
      }
      break;
    case 'set_thread':
      return {
        ...threadsState,
        currentThread: action.currentThread,
        isLoading: false,
        error: null
      }
      break;
    case 'set_error':
      return {
        ...threadsState,
        isLoading: false,
        error: action.error
      }
      break;
    case 'reset':
      return initialize(threadsInitialState);
      break;

  }
}
