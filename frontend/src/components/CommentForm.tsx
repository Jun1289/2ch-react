import axios from "axios";
import React, { useCallback, useRef, useState } from "react";
import { useUserContext } from "../context/userContext";
import { useParams } from "react-router-dom";
import { CommentFormProps } from "../types/types";

export const CommentForm: React.FC<CommentFormProps> = ({ commentDispatch }) => {
  const { threadId } = useParams()
  const { userState, userDispatch } = useUserContext()
  const { user } = userState
  const [inputError, setInputError] = useState<null | string>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const commentResponderRef = useRef<HTMLInputElement>(null)
  const commentContentRef = useRef<HTMLTextAreaElement>(null)

  // コメントの投稿
  const handleSubmit = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();

    // 入力フォームにコメントがなければエラー文を設定
    setInputError(null)
    if (!commentContentRef.current?.value) {
      setInputError("コメントを入力してください。")
    }
    if (inputError) return

    try {
      // 新しいコメントを作成。db.json に新しいコメントが追加される
      const fetchedNewCommentData = await axios.post(`/api/threads/${threadId}/comments`, {
        commenter: commentResponderRef.current?.value,
        commentContent: commentContentRef.current?.value,
      })
      const newCommentData = fetchedNewCommentData.data
      // state の commentsState に新しいコメントを追加する
      await commentDispatch({ type: 'add_comment', newComment: newCommentData })
      const commentId = newCommentData.id

      // ログインしている状態でコメント投稿した場合に、user にコメント履歴をつける処理
      if (user) {
        const newUser = {
          ...user,
          comments: [
            ...user.comments,
            commentId
          ]
        }
        await axios.put(`/api/users/${user.id}`, { ...newUser })
        await userDispatch({ type: 'add_comment', 'newComment': commentId })
      }
    } catch (error) {
      await commentDispatch({ type: 'set_error', error: `コメント投稿時にエラーが起きました。${error}` })
    }
    formRef.current?.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
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
  )
}
