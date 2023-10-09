import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";

export const Home = () => {
  const [threadsData, setThreadsData] = useState<null | { id: number, title: string }[]>(null);

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

  const addNewThread = (newThread: { id: number, title: string }) => {
    setThreadsData(prevThreads => [...(prevThreads || []), newThread]);
  }

  return (
    <div>
      <ThreadForm onThreadCreated={addNewThread} />
      {threadsData ? (
        <ul>
          {threadsData.map(thread => (
            <li key={thread.id}>
              {thread.id}: {thread.title}
            </li>
          ))}
        </ul>
      ) :
        <div>スレッドはまだありません</div>}
    </div>

  )
}
