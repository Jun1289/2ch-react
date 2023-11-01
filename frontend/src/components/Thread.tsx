import axios from "axios"
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReducer } from "react";
import { useUserContext } from "../state/userContext";

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
  // const { comments, commentsIsLoading, error } = commentsState
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
    newthread: Thread;
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

const threadReducer = (threadsState: ThreadsState, action: ThreadAction) => {
  // const { threads, threadsIsLoading, error } = threadsState
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
        threads: [...threadsState.threads, action.newthread],
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
  const [inputError, setInputError] = React.useState<null | string>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const commentResponderRef = React.useRef<HTMLInputElement>(null)
  const commentContentRef = React.useRef<HTMLTextAreaElement>(null)
  const { userState, userDispatch } = useUserContext()
  const { user } = userState

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

  const handleSubmit = React.useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();

    setInputError(null)
    if (!commentContentRef.current?.value) {
      setInputError("コメントを入力してください。")
    }
    if (inputError) return

    try {
      const response = await axios.post(`http://localhost:8000/threads/${threadId}/comments`, {
        responder: commentResponderRef.current?.value,
        commentContent: commentContentRef.current?.value,
      })
      commentDispatch({ type: 'add_comment', newComment: response.data })
      const commentId = response.data.id

      if (user) {
        const newUser = {
          ...user,
          comments: [
            ...user.comments,
            commentId
          ]
        }
        userDispatch({ type: 'add_comment', 'newComment': commentId })
        console.log(newUser)
        await axios.put(`http://localhost:8000/users/${userState.user?.id}`, { ...newUser })
      }
      formRef.current?.reset()
    } catch (error) {
      commentDispatch({ type: 'set_error', error: `コメント投稿時にエラーが起きました。${error}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
          <section>
            <h2>コメント投稿</h2>
            {inputError && <div style={{ color: 'red' }}>{inputError}</div>}
            <form ref={formRef} onSubmit={handleSubmit}>
              <div>
                <label htmlFor="responder">投稿者</label>
                <input
                  id="responder"
                  name="responder"
                  type="text"
                  ref={commentResponderRef}
                />
              </div>
              <div>
                <label htmlFor="commentContent">コメント</label>
                <textarea
                  id="commentContent"
                  name="commentContent"
                  ref={commentContentRef}
                />
              </div>
              <input type="submit" value="送信" />
            </form>
          </section>
        </div>
      )
    }
    </>
  )
}
