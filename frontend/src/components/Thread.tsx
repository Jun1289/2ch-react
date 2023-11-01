import axios from "axios"
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReducer } from "react";
import { CommentForm } from "./CommentForm";
import { CommentsState, ThreadsState } from "../types/state";
import { CommentAction, ThreadAction } from "../types/action";

const commentsInitialState: CommentsState = {
  comments: [],
  isLoading: true,
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

const threadsInitialState: ThreadsState = {
  threads: [],
  isLoading: true,
  currentThread: null,
  error: null
}

const threadReducer = (threadsState: ThreadsState, action: ThreadAction) => {
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

const formatDateTime = (dateString: string) => {
  const dateObj = new Date(dateString);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day}-${hours}:${minutes}:${seconds}`;
}

export const Thread = () => {
  const { threadId } = useParams()
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const [threadsState, threadDispatch] = useReducer(threadReducer, threadsInitialState);

  const handleDelete = async (commentId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:8000/comments/${commentId}`)
        .then(() => {
          commentDispatch({ type: 'delete_comment', commentId })
        })
    } catch (error: unknown) {
      commentDispatch({ type: 'set_error', error: `コメントの削除中にエラーが起きました。${error}` })
    }
  }

  // スレッドデータの取得
  useEffect(() => {
    const fetchThreadData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/threads/${threadId}`)
        threadDispatch({ type: 'set_thread', currentThread: response.data })
      } catch (error) {
        threadDispatch({ type: 'set_error', error: `スレッドデータの取得でエラーが発生しました。${error}` })
      }
    }
    fetchThreadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commentsData = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
        commentDispatch({ type: 'set_comments', comments: commentsData.data })
      } catch (error) {
        commentDispatch({ type: 'set_error', error: `コメントの取得でエラーが起きました。${error}` })
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>{
      (threadsState.isLoading || commentsState.isLoading) ? (
        null
      ) : (
        <div className="thread-wrapper content-wrapper">
          <section>
            <p className="thread_title">{threadsState.currentThread?.title}</p>
            <p>{threadsState.currentThread?.topic}</p>
          </section>
          <section>
            {(commentsState.comments && commentsState.comments.length != 0) ? (
              <ul>
                {commentsState.comments.map((comment) => (
                  <li key={comment.id}>
                    <div>
                      <span>{comment.commentNo}: {comment.responder} : {formatDateTime(comment.createdAt)}</span>
                      <button onClick={(e) => handleDelete(comment.id, e)}>削除</button>
                    </div>
                    <div>
                      {comment.commentContent}
                    </div>
                  </li>
                ))}
              </ul>
            ) :
              <div>コメントはまだありません</div>}
          </section>
          <CommentForm commentDispatch={commentDispatch} />
        </div>
      )
    }
    </>
  )
}
