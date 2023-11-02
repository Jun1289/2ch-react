import axios from "axios"
import React from "react";
import { ThreadFormProps } from "../types/types";

export const ThreadForm: React.FC<ThreadFormProps> = ({ threadsDispatch }) => {
  const [inputError, setInputError] = React.useState<null | string>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const threadTitleRef = React.useRef<HTMLInputElement>(null)
  const threadTopicRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit = React.useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();

    setInputError(null)
    if (!threadTitleRef.current?.value) {
      setInputError("タイトルを入力してください。")
    }
    if (!threadTopicRef.current?.value) {
      setInputError((prevError) => prevError ? prevError + "話題を入力してください。" : "話題を入力してください。")
    }
    if (inputError) return

    try {
      const response = await axios.post("http://localhost:8000/threads", {
        title: threadTitleRef.current?.value,
        topic: threadTopicRef.current?.value
      })
      threadsDispatch({ type: "add_thread", newThread: response.data })
      formRef.current?.reset()
    } catch (error) {
      console.error("新しいスレッド作成時にエラーが発生しました", error);
    }
  }, [])

  return (
    <section>
      {inputError && <p className="error">{inputError}</p>}
      <h2>スレッドの新規作成</h2>
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
          <label htmlFor="topic">話題</label>
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
