import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useUserContext } from "../context/userContext"
import Cookies from 'js-cookie';
import { commentReducer, commentsInitialState } from "../reducers/reducers";
import { Comment } from "../types/types";

export const User = () => {
  const navigate = useNavigate()
  const [inputError, setInputError] = useState<null | string>(null)
  const userNameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const { userState, userDispatch } = useUserContext()
  const { user, isLoading } = userState
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);

  // ログインの処理
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
        await axios.post("/api/users/signin", {
          name: userNameRef.current?.value,
          password: passwordRef.current?.value
        }, {
          withCredentials: true
        }).then(function (response) {
          const status = response.status
          if (status == 200) {
            userDispatch({ type: "set_user", user: response.data })
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

  // ユーザーの新規登録の処理
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
        await axios.post("/api/users/register", {
          name: inputedName,
          password: inputedPassword
        }, {
          withCredentials: true
        }).then(function (response) {
          const status = response.status
          if (status == 200) {
            userDispatch({ type: "set_user", user: response.data })
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

  // ログアウトの処理
  const toLogout = async () => {
    try {
      await axios.post("/api/users/logout", null, {
        withCredentials: true
      })
      Cookies.remove('token')
      userDispatch({ type: "set_user", user: null })
    } catch (error) {
      console.error("ログアウト時にエラーが発生しました。", error)
    }
  }

  // ログインしていて、ユーザーにコメント履歴があれば表示する
  useEffect(() => {
    const fetchedCommentsData = async () => {
      if (!user) return
      try {
        if (user.comments === undefined) return
        const commentsByUser: Comment[] = []
        for (const commentId of user.comments) {
          await axios.get(`/api/comments/${commentId}`).then((response) => {
            commentsByUser.push(response.data)
          })
        }
        commentDispatch({ type: 'set_comments', comments: commentsByUser })
      } catch (error) {
        console.error("コメントの取得でエラーが発生しました。", error);
      }
    }
    fetchedCommentsData()
  }, [user])

  return (
    <>
      {isLoading ? (
        null
      ) : (
        <>
          {user ? (
            <>
              <h2>ユーザープロフィール</h2>
              <dl>
                <dt>ユーザー名</dt>
                <dd>{user.name}</dd>
                <dt>コメント履歴</dt>
                <dd>
                  {commentsState.isLoading ? (
                    null
                  ) : (
                    commentsState.comments && commentsState.comments.length > 0 ? (
                      <ul>
                        {commentsState.comments.map(comment => (
                          <li key={comment.id}>{comment.commentContent}</li>
                        ))}
                      </ul>
                    ) : (
                      <div>投稿したコメントはありません。</div>
                    ))}
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
              <button onClick={() => console.log(userState.user)}>ユーザーの確認</button>
            </>
          )}
        </>)
      }
    </>
  )
}
