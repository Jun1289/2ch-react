import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";
import { Link } from "react-router-dom";
import { useReducer } from "react";

type Comment = {
  id: number,
  commentNo: number,
  responder: string,
  commentContent: string,
  createdAt: string,
  updatedAt: string,
  threadId: number
}

type CommentsState = {
  comments: Comment[],
  isLoading: boolean,
  currentComment: null | Comment
  error: null | string,
}

type CommentAction =
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

const commentsInitialState: CommentsState = {
  comments: [],
  isLoading: true,
  currentComment: null,
  error: null
}

const commentReducer = (commentsState: CommentsState, action: CommentAction) => {
  switch (action.type) {
    case 'delete_comment': {
      const newCommentsData = commentsState.comments?.filter((comment) => {
        return comment.id !== action.commentId
      }) || null;
      return {
        ...commentsState,
        comments: [...newCommentsData]
      }
      break;
    }
    case 'add_comment':
      return {
        ...commentsState,
        comments: [...commentsState.comments, action.newComment],
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
        error: action.error
      }
      break;
  }
}

type Thread = {
  id: number,
  title: string,
  topic: string,
  createdAt: string,
  updatedAt: string,
  commentTotal: number,
  builder: string
}

type ThreadsState = {
  threads: Thread[],
  isLoading: boolean,
  currentThread: null | Thread,
  error: null | string
}

type ThreadAction =
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

const threadsInitialState: ThreadsState = {
  threads: [],
  isLoading: true,
  currentThread: null,
  error: null
}

const threadsReducer = (threadsState: ThreadsState, action: ThreadAction) => {
  switch (action.type) {
    case 'delete_thread': {
      const newthreadsData = threadsState.threads?.filter((thread) => {
        return thread.id !== action.threadId
      }) || null;
      return {
        ...threadsState,
        threads: [...newthreadsData]
      }
      break;
    }
    case 'add_thread':
      return {
        ...threadsState,
        threads: [...threadsState.threads, action.newThread],
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
      }
      break;
    case 'set_error':
      return {
        ...threadsState,
        error: action.error
      }
      break;
  }
}

export const Home = () => {
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const [threadsState, threadsDispatch] = useReducer(threadsReducer, threadsInitialState);

  const handleDelete = async (threadId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:8000/threads/${threadId}`)
        .then(function () {
          threadsDispatch({ type: "delete_thread", threadId })
        })
    } catch (error) {
      console.error("コメントの削除でエラーが発生しました:", error);
    }
  }

  const getCommentCnt = async (threadId: number): Promise<number> => {
    const response = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
    const comments = response.data
    return comments.length
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/threads');
        const threads = response.data
        threadsDispatch({ type: 'set_threads', threads })
        if (threads && threads.length > 0) {
          const counts: Record<number, number> = {};
          for (const thread of threads) {
            counts[thread.id] = await getCommentCnt(thread.id);
          }
          setCommentCounts(counts);
        }
        commentDispatch({ type: 'set_comments', comments: [] })
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchData();
  }, [])

  return (
    <div>
      <ThreadForm onThreadCreated={threadsDispatch} />
      {
        (threadsState.isLoading || commentsState.isLoading) ? (
          null
        ) : (
          <section>
            <h2>スレッド一覧</h2>
            {threadsState.threads ? (
              <ul>
                {
                  threadsState.threads.map(thread => (
                    <li key={thread.id}>
                      <Link to={`/threads/${thread.id}`}>
                        <span>{thread.id}: {thread.title} ({commentCounts[thread.id] || 0})</span>
                      </Link>
                      <button onClick={(e) => handleDelete(thread.id, e)}>削除</button>
                    </li>
                  ))
                }
              </ul>
            ) : (
              <div>スレッドはまだありません</div>
            )}
          </section>)}
    </div >
  )
}

