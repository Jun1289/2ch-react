import axios from "axios"
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import { CommentForm } from "./CommentForm";

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


export const Thread = () => {
  const { threadId } = useParams()
  const [commentsData, setCommentsData] = useState<null | Comment[]>(null);
  const [threadData, setThreadData] = useState<null | Thread>(null);
  const [inputError, setInputError] = React.useState<null | string>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const commentResponderRef = React.useRef<HTMLInputElement>(null)
  const commentContentRef = React.useRef<HTMLTextAreaElement>(null)
  const [loadingComment, setLoadingComment] = useState(true)
  const [loadingThread, setLoadingThread] = useState(true)

  const addNewComment = (newComment: Comment) => {
    setCommentsData(prevComments => [...(prevComments || []), newComment]);
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

  const handleDelete = async (commentId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    console.log(commentId)

    try {
      await axios.delete(`http://localhost:8000/comments/${commentId}`)
        .then(function (response) {
          console.log(response.data)
          const newCommentsData = commentsData?.filter((comment) => {
            return comment.id !== commentId
          }) || null;
          console.log(newCommentsData)
          setCommentsData(newCommentsData)
        })
    } catch (error) {
      console.error("コメントの削除でエラーが発生しました:", error);
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
      console.log(response.data)
      addNewComment(response.data)
      formRef.current?.reset()
    } catch (error) {
      console.error("新しいスレッド作成時にエラーが発生しました", error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNewComment])

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
        setCommentsData(commentsData.data);
        setLoadingComment(false)
      } catch (error) {
        console.error("コメントの取得でエラーが発生しました:", error);
        setLoadingComment(false)
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>{
      (loadingThread || loadingComment) ? (
        null
      ) : (
        <div className="thread-wrapper content-wrapper">
          <section>
            <p className="thread_title">{threadData?.title}</p>
            <p>{threadData?.topic}</p>
          </section>
          <section>
            {commentsData ? (
              <ul>
                {commentsData.map((comment, index) => (
                  <li key={index}>
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
