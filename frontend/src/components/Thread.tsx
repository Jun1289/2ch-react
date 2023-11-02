import axios from "axios"
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReducer } from "react";
import { CommentForm } from "./CommentForm";
import { commentReducer, commentsInitialState, threadReducer, threadsInitialState } from "../reducers/reducers";
import { useUserContext } from "../context/userContext";

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
  const { userState, userDispatch } = useUserContext()

  const handleDelete = async (commentId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:8000/comments/${commentId}`, {
        withCredentials: true
      })
        .then(() => {
          commentDispatch({ type: 'delete_comment', commentId })
          userDispatch({ type: 'delete_comment', commentId })
        })
      console.log(userState.user)
      await axios.put(`http://localhost:8000/users/${userState.user?.id}`, {
        ...userState.user,
        comments: userState.user?.comments.filter((comment) => comment !== commentId)
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
