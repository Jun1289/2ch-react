import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";
import { Link } from "react-router-dom";

export const Home = () => {
  const [threadsData, setThreadsData] = useState<null | { id: number, title: string }[]>(null);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});


  const addNewThread = (newThread: { id: number, title: string }) => {
    setThreadsData(prevThreads => [...(prevThreads || []), newThread]);
  }

  const getCommentCnt = async (threadId: number): Promise<number> => {
    const response = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
    const comments = response.data
    console.log("comments", comments)
    console.log("response", response)
    return comments.length
  }

  useEffect(() => {
    // ここで非同期データを取得
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/threads');
        setThreadsData(response.data);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchData();
  }, [])

  useEffect(() => {
    const fetchCommentCounts = async () => {
      if (threadsData) {
        const counts: Record<number, number> = {};
        for (const thread of threadsData) {
          counts[thread.id] = await getCommentCnt(thread.id);
        }
        setCommentCounts(counts);
      }
    };
    fetchCommentCounts();
  }, [threadsData]);

  return (
    <div>
      <ThreadForm onThreadCreated={addNewThread} />
      {threadsData ? (
        <ul>
          {threadsData.map(thread => (
            <li key={thread.id}>
              <Link to={`/threads/${thread.id}`}>
                {thread.id}: {thread.title} ({commentCounts[thread.id] || 0})
              </Link>
            </li>
          ))}
        </ul>
      ) :
        <div>スレッドはまだありません</div>}
    </div>
  )
}
