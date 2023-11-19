import React from "react";
import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";
import { Link } from "react-router-dom";
import { useReducer } from "react";
import { threadReducer, threadsInitialState } from "../reducers/reducers";
import { useUserContext } from "../context/userContext";


export const Home = () => {
  const [commentCounts, setCommentsCount] = useState<Record<number, number>>({});
  const [threadsState, threadsDispatch] = useReducer(threadReducer, threadsInitialState);
  const { threads, isLoading: threadsIsLoading, error: threadsError } = threadsState
  const { userDispatch } = useUserContext()

  // スレッドのコメント数を取得
  const getCommentCnt = async (threadId: number): Promise<number> => {
    const response = await axios.get(`/api/threads/${threadId}/comments`)
    const comments = response.data
    return comments.length
  }

  // 全てリセットの処理
  const handleReset = async () => {
    try {
      await axios.delete('/api/reset')
      threadsDispatch({ type: "reset" })
      userDispatch({ type: "reset" })
      setCommentsCount({})
    } catch (error) {
      threadsDispatch({ type: "set_error", error: `全てリセットの処理でエラーが発生しました。${error}` });
    }
  }
  // スレッドの取得と各スレッドのコメント数を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // スレッドの取得
        const fetchedThreadsData = await axios.get('/api/threads')
        const threadsData = fetchedThreadsData.data
        await threadsDispatch({ type: 'set_threads', threads: threadsData })
        if (threadsData && threadsData.length > 0) {
          // 各スレッドのコメント数を取得し、counts[thread.id]にthreadのコメント数を格納 
          const counts: Record<number, number> = {};
          for (const thread of threadsData) {
            counts[thread.id] = await getCommentCnt(thread.id);
          }
          // 各スレッドのコメント数をセット
          setCommentsCount(counts);
        }
      } catch (error) {
        threadsDispatch({ type: "set_error", error: `スレッドデータの取得でエラーが発生しました。${error}` })
      }
    };
    fetchData();
  }, [])

  return (
    <div>
      {threadsError && (
        <p className="error">{threadsError}</p>
      )}
      <ThreadForm threadsDispatch={threadsDispatch} />
      {
        (threadsIsLoading) ? (
          null
        ) : (
          <section>
            <h2>スレッド一覧</h2>
            {threads && threads.length > 0 ? (
              <ul>
                {
                  threads.map(thread => (
                    <li key={thread.id}>
                      <Link to={`/threads/${thread.id}`}>
                        <span>{thread.id}: {thread.title} ({commentCounts[thread.id] || 0})</span>
                      </Link>
                    </li>
                  ))
                }
              </ul>
            ) : (
              <div>スレッドはまだありません</div>
            )}
          </section>)}
      <button onClick={() => handleReset()}>全てリセット</button>
    </div >
  )
}

