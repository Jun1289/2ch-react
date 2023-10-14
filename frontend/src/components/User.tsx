import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import axios from "axios"

// type Params = {
//   userId: string;
// }
export const User = () => {
  const { userId } = useParams()
  const [user, setUser] = useState<null | { name: string, hashedPassword: string, likes: string[] }>(null);

  useEffect(() => {
    const fetchedUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${userId}`)
        setUser(response.data)
      } catch (error) {
        console.error("ユーザ情報の取得でエラーが発生しました。", error)
      }
    }
    fetchedUser()
  }, [userId])

  return (
    <>
      <h2>ユーザープロフィール</h2>
      {user ? (
        <>
          <dl>
            <dt>ユーザー名</dt>
            <dd>{user.name}</dd>
            <dt>お気に入りスレッド一覧</dt>
            <dd>
              {user.likes && user.likes.length > 0 ? (
                <ul>
                  {user.likes.map(like => (
                    <li key={like}><Link to={`/threads/${like}`}>スレッド{like}</Link></li>
                  ))}
                </ul>
              ) : (
                "お気に入りのスレッドはまだありません。"
              )}
            </dd>
          </dl>
          <button>ログアウト</button>
        </>
      ) : (
        <button>ログイン</button>
      )}
    </>
  )
}
