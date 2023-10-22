import axios from "axios"
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import { CommentForm } from "./CommentForm";

export const Thread = () => {
  const { threadId } = useParams()
  const [commentsData, setCommentsData] = useState<null | { responder: string, commentContent: string, commentNo: number, createdAt: string }[]>(null);
  const [threadData, setThreadData] = useState<null | { builder: string, title: string, topic: number, createdAt: string }>(null);
  const [inputError, setInputError] = React.useState<null | string>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const commentResponderRef = React.useRef<HTMLInputElement>(null)
  const commentContentRef = React.useRef<HTMLTextAreaElement>(null)
  const [loadingComment, setLoadingComment] = useState(true)
  const [loadingThread, setLoadingThread] = useState(true)

  const addNewComment = (newComment: { responder: string, commentContent: string, commentNo: number, createdAt: string }) => {
    setCommentsData(prevComments => [...(prevComments || []), newComment]);
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
                      {comment.commentNo} : {comment.responder} : {comment.createdAt}
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
