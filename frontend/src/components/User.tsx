import { useCallback, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useUserContext } from "../state/userContext"
import Cookies from 'js-cookie';

export const User = () => {
  const navigate = useNavigate()
  // const [userInfo, setUserInfo] = useState<null | { id: number, name: string, hashedPassword: string, likes: string[] }>(null);
  const [inputError, setInputError] = useState<null | string>(null)
  // const [loading, setLoading] = useState(true);
  const userNameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { user, setUser, loading } = useUserContext()

  console.log(user)
  const hundleLogin = useCallback<React.FormEventHandler>(async (event) => {
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
      try {
        await axios.post("http://127.0.0.1:8000/users/register", {
          name: userNameRef.current?.value,
          password: passwordRef.current?.value
        }, {
          withCredentials: true
        }).then(function (response) {
          const status = response.status
          if (status == 200) {
            // setUserInfo(response.data)
            console.log(response.data)
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

  return (
    <>
      {loading ? (
        null
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
