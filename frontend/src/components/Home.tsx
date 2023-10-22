import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";
import { Link } from "react-router-dom";
import { useUserContext } from "../state/userContext";

type Thread = {
  id: number,
  title: string,
  topic: string,
  createdAt: string,
  updatedAt: string,
  commentTotal: number,
  builder: string
}

export const Home = () => {
  const [threadsData, setThreadsData] = useState<null | Pick<Thread, "id" | "title">[]>(null);
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const [loadingThread, setLoadingThread] = useState(true)
  const [loadingComment, setLoadingComment] = useState(true)
  const { user, setUser } = useUserContext()

  const addNewThread = (newThread: { id: number, title: string }) => {
    setThreadsData(prevThreads => [...(prevThreads || []), newThread]);
  }

  const handleDelete = async (threadId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    console.log(threadId)

    try {
      await axios.delete(`http://localhost:8000/threads/${threadId}`)
        .then(function (response) {
          console.log(response.data)
          const newThreadsData = threadsData?.filter((thread) => {
            return thread.id !== threadId
          }) || null;
          console.log(newThreadsData)
          setThreadsData(newThreadsData)
        })
    } catch (error) {
      console.error("コメントの削除でエラーが発生しました:", error);
    }
  }

  const getCommentCnt = async (threadId: number): Promise<number> => {
    const response = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
    const comments = response.data
    setLoadingComment(false)
    return comments.length
  }

  const handleFavorite = (event: React.MouseEvent<Element, MouseEvent>, threadId: number) => {
    console.log(threadId)
    const target = event.currentTarget

    const toggleFavorite = async () => {
      try {
        await axios.post(`http://localhost:8000/users/${user?.id}/toggle-favorite/${threadId}`)
          .then(function (response) {
            console.log(response.data.user)
            setUser(response.data.user)
            const islike = user?.likes.includes(threadId.toString())
            if (islike) {
              // event.currentTarget.classList.remove('added')
              target.classList.remove('added')
              setUser((prevUser) => {
                if (!prevUser) return null;
                const islikes = prevUser?.likes.filter((like) => {
                  return like !== threadId.toString()
                })
                console.log("after toggle : ", islikes)
                return ({
                  ...prevUser,
                  likes: islikes
                })
              })
            } else if (!islike) {
              // event.currentTarget.classList?.add('added')
              target.classList?.add('added')
              setUser((prevUser) => {
                if (!prevUser) return null;
                const islikes = [...prevUser.likes, threadId.toString()]
                console.log("after toggle : ", islikes)
                return ({
                  ...prevUser,
                  likes: islikes
                })
              })
            }
          })
      } catch (error) {
        console.error("お気に入りの切り替えに失敗しました。", error)
      }
    }
    toggleFavorite()
  }

  useEffect(() => {
    // ここで非同期データを取得
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/threads');
        setThreadsData(response.data);
        setLoadingThread(false)
        console.log("fetch user", user)
      } catch (error) {
        console.error("Error fetching threads:", error);
        setLoadingThread(false)
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
      {
        loadingThread || loadingComment ? (
          null
        ) : (
          <section>
            <h2>スレッド一覧</h2>
            {threadsData ? (
              <ul>
                {
                  threadsData.map(thread => (
                    <li key={thread.id}>
                      <Link to={`/threads/${thread.id}`}>
                        <span>{thread.id}: {thread.title} ({commentCounts[thread.id] || 0})</span>
                      </Link>
                      {user ? (
                        <a href="#" className={user.likes.includes(thread.id.toString()) ? "added" : ""} onClick={(event) => handleFavorite(event, thread.id)}>★</a>
                      ) : (
                        null
                      )}
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

