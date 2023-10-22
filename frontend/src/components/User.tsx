import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useUserContext } from "../state/userContext"
import Cookies from 'js-cookie';

type Thread = {
  id: number,
  title: string,
  topic: string,
  createdAt: string,
  updatedAt: string,
  commentTotal: number,
  builder: string
}

export const User = () => {
  const navigate = useNavigate()
  const [threadsData, setThreadsData] = useState<null | Thread[]>(null);
  // const [userInfo, setUserInfo] = useState<null | { id: number, name: string, hashedPassword: string, likes: string[] }>(null);
  const [inputError, setInputError] = useState<null | string>(null)
  // const [loading, setLoading] = useState(true);
  const userNameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { user, setUser, loading } = useUserContext()

  // console.log(user)
  const hundleLogin = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();
    setInputError(null)

    const fetchedUser = async () => {
      const inputedName = userNameRef.current?.value
      const inputedPassword = passwordRef.current?.value

      if (!inputedName) {
        setInputError("ユーザー名を入力してください。")
      }
      if (!inputedPassword) {
        setInputError((prevError) => prevError ? prevError + "パスワードを入力してください。" : "パスワードを入力してください。")
      }
      if (!inputedName || !inputedPassword) return

      try {
        await axios.post("http://127.0.0.1:8000/users/signin", {
          name: userNameRef.current?.value,
          password: passwordRef.current?.value
        }, {
          withCredentials: true
        }).then(function (response) {
          const status = response.status
          if (status == 200) {
            // setUserInfo(response.data)
            setUser(response.data)
            navigate(`/user/${response.data.id}`)
          } else {
            setInputError("ユーザー名かパスワードが間違っています")
          }
        })
      } catch (error) {
        console.error("ログイン時にエラーが発生しました。", error)
      }
    }
    fetchedUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const hundleSignup = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();
    setInputError(null)
    const fetchedUser = async () => {
      const inputedName = userNameRef.current?.value
      const inputedPassword = passwordRef.current?.value

      if (!inputedName) {
        setInputError("ユーザー名を入力してください。")
      }
      if (!inputedPassword) {
        setInputError((prevError) => prevError ? prevError + "パスワードを入力してください。" : "パスワードを入力してください。")
      }
      if (!inputedName || !inputedPassword) return

      try {
        await axios.post("http://127.0.0.1:8000/users/register", {
          name: inputedName,
          password: inputedPassword
        }, {
          withCredentials: true
        }).then(function (response) {
          const status = response.status
          if (status == 200) {
            setUser(response.data)
            navigate(`/user/${response.data.id}`)
          } else {
            setInputError("ユーザー名かパスワードが間違っています")
          }
        })
      } catch (error) {
        console.error("新規ユーザー作成時にエラーが発生しました。", error)
      }
    }
    fetchedUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/users/logout", null, {
        withCredentials: true
      })
      console.log("ログアウトのボタンが押されました")
      Cookies.remove('token')
      setUser(null)
    } catch (error) {
      console.error("ログアウト時にエラーが発生しました。", error)
    }
  }

  const handleFavorite = (event: React.MouseEvent<Element, MouseEvent>, threadId: number) => {
    const deleteFavorite = async () => {
      try {
        await axios.get(`http://localhost:8000/users/${user?.id}`)
          .then(function (response) {
            let fetchedUser = response.data
            console.log("before filter", fetchedUser)
            fetchedUser = fetchedUser.likes?.filter((id: string) => parseInt(id, 10) != threadId)
            console.log("after filter", fetchedUser)

            setUser(fetchedUser)
          })
      } catch (error) {
        console.error("お気に入りの切り替えに失敗しました。", error)
      }
    }
    deleteFavorite()
  }


  useEffect(() => {
    // ここで非同期データを取得
    const fetchedThreadsData: Thread[] = []
    const fetchThreadsData = async () => {
      try {
        if (user && user.likes.length > 0) {
          for (const like of user.likes) {
            const response = await axios.get(`http://localhost:8000/threads/${like}`);
            fetchedThreadsData.push(response.data)
          }
          setThreadsData(fetchedThreadsData);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchThreadsData();
  }, [user])

  return (
    <>
      {loading ? (
        null
      ) : (
        <>
          {user ? (
            <>
              <h2>ユーザープロフィール</h2>
              <dl>
                <dt>ユーザー名</dt>
                <dd>{user.name}</dd>
                <dt>お気に入りスレッド一覧</dt>
                <dd>
                  {threadsData && threadsData.length > 0 ? (
                    <ul>
                      {threadsData.map(thread => (
                        <li key={thread.id}>
                          <Link to={`/threads/${thread.id}`}>
                            {thread.title}
                          </Link>
                          <a href="#" className="added" onClick={(event) => handleFavorite(event, thread.id)}>★</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "お気に入りのスレッドはまだありません。"
                  )}
                </dd>
              </dl>
              <button onClick={toLogout}>ログアウト</button>
            </>
          ) : (
            <>
              {inputError ? <p className="error">{inputError}</p> : null}
              <form ref={formRef}>
                <div>
                  <label htmlFor="userName">ユーザー名</label>
                  <input id="userName" type="text" ref={userNameRef} />
                </div>
                <div>
                  <label htmlFor="password">パスワード</label>
                  <input id="password" type="password" ref={passwordRef} />
                </div>
                <div>
                  <button onClick={hundleLogin}>ログイン</button>
                </div>
                <div>
                  <button onClick={hundleSignup}>新規ユーザー作成</button>
                </div>
              </form>
            </>
          )}
        </>)}
    </>
  )
}
