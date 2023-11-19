import React from "react";
import axios from "axios"
import { useCallback, useRef, useState } from "react";
import { ThreadFormProps } from "../types/types";

export const ThreadForm: React.FC<ThreadFormProps> = ({ threadsDispatch }) => {
  const [inputError, setInputError] = useState<null | string>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const threadTitleRef = useRef<HTMLInputElement>(null)
  const threadTopicRef = useRef<HTMLTextAreaElement>(null)

  // スレッドの新規作成
  const handleSubmit = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();

    // スレッドの新規作成時にフォームに入力がなければエラー文を設定
    setInputError(null)
    if (!threadTitleRef.current?.value) {
      setInputError("タイトルを入力してください。")
    }
    if (!threadTopicRef.current?.value) {
      setInputError((prevError) => prevError ? prevError + "トピックを入力してください。" : "トピックを入力してください。")
    }
    if (inputError) return

    try {
      // 新しいスレッドを作成。db.json に新しいスレッドが追加される
      const fetchedNewThread = await axios.post("/api/threads", {
        title: threadTitleRef.current?.value,
        topic: threadTopicRef.current?.value
      })
      const newThread = fetchedNewThread.data
      // state の threadsState に新しいスレッドを追加する
      threadsDispatch({ type: "add_thread", newThread: newThread })
      // 入力フォームをリセット
      formRef.current?.reset()
    } catch (error) {
      threadsDispatch({ type: "set_error", error: `新しいスレッド作成時にエラーが発生しました。${error}` })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section>
      <h2>スレッドの新規作成</h2>
      {inputError && <p className="error">{inputError}</p>}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            name="title"
            type="text"
            ref={threadTitleRef}
          />
        </div>
        <div>
          <label htmlFor="topic">トピック</label>
          <textarea
            id="topic"
            name="topic"
            ref={threadTopicRef}
          />
        </div>
        <input type="submit" value="送信" />
      </form>
    </section>
  )
}
