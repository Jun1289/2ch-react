import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { UserProvider, useUserContext } from "../state/userContext"
import Cookies from 'js-cookie';
import { patienceDiff } from "./dif.js"

export const User = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  // const [userInfo, setUserInfo] = useState<null | { id: number, name: string, hashedPassword: string, likes: string[] }>(null);
  const [inputError, setInputError] = useState<null | string>(null)
  const [loading, setLoading] = useState(true);
  const userNameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { user, setUser } = useUserContext()

  const token = Cookies.get('token')


  useEffect(() => {
    const fetchedUser = async () => {
      try {
        // const response = await axios.get(`http://localhost:8000/users?token=${token1}`)
        const response = await axios.get(`http://localhost:8000/users?token=${token}`)
        // const response = await axios.get(`http://localhost:8000/users?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidXNlcjgiLCJpYXQiOjE2OTY4MTU5OTksImV4cCI6MTY5NjkwMjM5OX0.o2K0CjrLxKCCCOfzns-uulXuZxQQnmxPxha7XKUV1fM`)
        const status = response.status
        const emptyData = !response.data.length
        console.log(response.data)
        if (status == 200 && !emptyData) {
          console.log("200 res")
          // setUserInfo(response.data)
          console.log("response.data", response.data)
          setUser(response.data[0])
          setLoading(false)
          navigate(`/user/${response.data[0].id}`)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("ログイン時にエラーが発生しました。", error)
        setLoading(false)
      }
    }
    fetchedUser()
  }, [token])

  const hundleSubmit = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();
    setInputError(null)
    const fetchedUser = async () => {
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
            navigate(`${response.data.id}`)
          } else {
            setInputError("ユーザー名かパスワードが間違っています")
          }
        })
      } catch (error) {
        console.error("ログイン時にエラーが発生しました。", error)
      }
    }
    fetchedUser()
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

  return (
    <>
      {loading ? (
        <div>
          Loading...
        </div>
      ) : (
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
              <button onClick={toLogout}>ログアウト</button>
            </>
          ) : (
            <>
              {inputError ? <p>{inputError}</p> : null}
              <form ref={formRef} onSubmit={hundleSubmit}>
                <div>
                  <label htmlFor="userName">ユーザー名</label>
                  <input id="userName" type="text" ref={userNameRef} />
                </div>
                <div>
                  <label htmlFor="password">パスワード</label>
                  <input id="password" type="password" ref={passwordRef} />
                </div>
                <input type="submit" value="ログイン" />
              </form>
            </>
          )}
        </>)}
    </>
  )
}
