import axios from "axios"
import React from "react";

interface ThreadFormProps {
  onThreadCreated: (newThread: { id: number, title: string }) => void;
}

export const ThreadForm: React.FC<ThreadFormProps> = ({ onThreadCreated }) => {
  const threadBuilderRef = React.useRef<HTMLInputElement>(null)
  const threadTitleRef = React.useRef<HTMLInputElement>(null)
  const threadTopicRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSubmit = React.useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/threads", {
        builder: threadBuilderRef.current?.value,
        title: threadTitleRef.current?.value,
        topic: threadTopicRef.current?.value
      })
      onThreadCreated(response.data)
    } catch (error) {
      console.error("新しいスレッド作成時にエラーが発生しました", error);
    }
  }, [onThreadCreated])

  return (
    <section>
      <p>スレッドの新規作成</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="builder">スレ主</label>
          <input
            id="builder"
            name="builder"
            type="text"
            ref={threadBuilderRef}
          />
        </div>
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
