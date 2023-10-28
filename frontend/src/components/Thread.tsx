import axios from "axios"
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import { CommentForm } from "./CommentForm";
import { useReducer } from "react";

type Thread = {
  id: number,
  title: string,
  topic: string,
  createdAt: string,
  updatedAt: string,
  commentTotal: number,
  builder: string
}

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
  commentsIsLoading: boolean,
  error: null | string
}

type Action =
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



const commentReducer = (commentsState: CommentsState, action: Action) => {
  // const { comments, commentsIsLoading, error } = commentsState
  switch (action.type) {
    case 'delete_comment': {
      console.log("commentsData", action.commentId)
      const newCommentsData = commentsState.comments?.filter((comment) => {
        return comment.id !== action.commentId
      }) || null;
      console.log("newCommentsData", newCommentsData)
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
      console.log("payload", action.comments)
      return {
        ...commentsState,
        comments: action.comments,
        commentsIsLoading: false,
        error: null
      }
      break;
    case 'set_error':
      console.log("error", action.error)
      return {
        ...commentsState,
        error: action.error
      }
      break;
  }
}

const commentsInitialState: CommentsState = {
  comments: [],
  commentsIsLoading: true,
  error: null

}

export const Thread = () => {
  const { threadId } = useParams()
  const [threadData, setThreadData] = useState<null | Thread>(null);
  const [inputError, setInputError] = React.useState<null | string>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const commentResponderRef = React.useRef<HTMLInputElement>(null)
  const commentContentRef = React.useRef<HTMLTextAreaElement>(null)
  const [loadingThread, setLoadingThread] = useState(true)

  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);

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

  const handleDelete = async (commentId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    console.log(commentId)
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
        console.log(response.data)
        setThreadData(response.data)
        setLoadingThread(false)
      } catch (error) {
        console.error("スレッドデータの取得でエラーが発生しました")
        setLoadingThread(false)
      }
    }
    fetchThreadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  useEffect(() => {
    // ここで非同期データを取得
    const fetchData = async () => {
      try {
        const commentsData = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
        commentDispatch({ type: 'set_comments', comments: commentsData.data })
        // setLoadingComment(false)
      } catch (error) {
        console.error("コメントの取得でエラーが発生しました:", error);
        // setLoadingComment(false)
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>{
      (loadingThread || commentsState.commentsIsLoading) ? (
        null
      ) : (
        <div className="thread-wrapper content-wrapper">
          <section>
            <p className="thread_title">{threadData?.title}</p>
            <p>{threadData?.topic}</p>
          </section>
          <section>
            {(commentsState.comments && commentsState.comments.length != 0) ? (
              console.log("commentsState", commentsState),
              console.log("commentsState.length", commentsState.comments.length),
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
