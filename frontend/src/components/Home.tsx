import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";
import { Link } from "react-router-dom";
import { useReducer } from "react";
import { commentReducer, commentsInitialState, threadReducer, threadsInitialState } from "../reducers/reducer";

export const Home = () => {
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const [threadsState, threadsDispatch] = useReducer(threadReducer, threadsInitialState);

  const handleDelete = async (threadId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:8000/threads/${threadId}`)
        .then(function () {
          threadsDispatch({ type: "delete_thread", threadId })
        })
    } catch (error) {
      console.error("コメントの削除でエラーが発生しました:", error);
    }
  }

  const getCommentCnt = async (threadId: number): Promise<number> => {
    const response = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
    const comments = response.data
    return comments.length
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/threads');
        const threads = response.data
        threadsDispatch({ type: 'set_threads', threads })
        if (threads && threads.length > 0) {
          const counts: Record<number, number> = {};
          for (const thread of threads) {
            counts[thread.id] = await getCommentCnt(thread.id);
          }
          setCommentCounts(counts);
        }
        commentDispatch({ type: 'set_comments', comments: [] })
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchData();
  }, [])

  return (
    <div>
      <ThreadForm onThreadCreated={threadsDispatch} />
      {
        (threadsState.isLoading || commentsState.isLoading) ? (
          null
        ) : (
          <section>
            <h2>スレッド一覧</h2>
            {threadsState.threads ? (
              <ul>
                {
                  threadsState.threads.map(thread => (
                    <li key={thread.id}>
                      <Link to={`/threads/${thread.id}`}>
                        <span>{thread.id}: {thread.title} ({commentCounts[thread.id] || 0})</span>
                      </Link>
                      <button onClick={(e) => handleDelete(thread.id, e)}>削除</button>
                    </li>
                  ))
                }
              </ul>
            ) : (
              <div>スレッドはまだありません</div>
            )}
          </section>)}
    </div >
  )
}

