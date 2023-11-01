import axios from "axios";
import React, { useCallback, useRef, useState } from "react";
import { useUserContext } from "../context/userContext";
import { useParams } from "react-router-dom";
import { CommentFormProps } from "../types/props";

export const CommentForm: React.FC<CommentFormProps> = ({ commentDispatch }) => {
  const { threadId } = useParams()
  const { userState, userDispatch } = useUserContext()
  const { user } = userState
  const [inputError, setInputError] = useState<null | string>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const commentResponderRef = useRef<HTMLInputElement>(null)
  const commentContentRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback<React.FormEventHandler>(async (event) => {
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
      userDispatch({ type: 'set_error', error: `コメント投稿時にエラーが起きました。${error}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
