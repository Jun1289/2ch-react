import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios"

// type Params = {
//   userId: string;
// }


export const User = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<null | { id: number, name: string, hashedPassword: string, likes: string[] }>(null);
  const [inputError, setInputError] = useState<null | string>(null)
  const userNameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // useEffect(() => {
  //   const fetchedUser = async () => {
  //     const response = await axios.get(`http://localhost:8000/users/${userId}`)
  //     setUser(response.data)
  //   }
  //   fetchedUser()
  // }, [userId])

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
            console.log(response.data)
            { response ? setUser(response.data) : setInputError("ユーザー名かパスワードが間違っています") }
            navigate(`${response.data.id}`)
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
    } catch (error) {
      console.error("ログアウト時にエラーが発生しました。", error)
    }
  }

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
    </>
  )
}
