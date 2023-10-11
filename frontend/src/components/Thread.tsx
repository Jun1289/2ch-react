import axios from "axios"
import React, { useEffect, useState } from "react";
// import { CommentForm } from "./CommentForm";

export const Thread = () => {
  const [commentsData, setCommentsData] = useState<null | { responder: string, commentContent: string, commentNo: number, createdAt: string }[]>(null);
  const [inputError, setInputError] = React.useState<null | string>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const commentResponderRef = React.useRef<HTMLInputElement>(null)
  const commentContentRef = React.useRef<HTMLTextAreaElement>(null)

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
      const response = await axios.post("http://localhost:8000/threads/1/comments", {
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

  useEffect(() => {
    // ここで非同期データを取得
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/comments');
        setCommentsData(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchData();
  }, [])


  return (
    <div>
      <section>
        {inputError && <div style={{ color: 'red' }}>{inputError}</div>}
        <p>コメント投稿</p>
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
        <div>スレッドはまだありません</div>}
    </div>
  )
}
