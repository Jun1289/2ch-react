import React from "react";
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
  const { userState, userDispatch, setToken } = useUserContext()
  const { user, isLoading, error: userError } = userState
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);

  // ログインの処理
  const handleLogin = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();
    setInputError(null)

    const fetchUser = async () => {
      const inputedName = userNameRef.current?.value
      const inputedPassword = passwordRef.current?.value
      // ユーザー名かパスワードが入力されていなければエラー文を設定
      if (!inputedName) {
        setInputError("ユーザー名を入力してください。")
      }
      if (!inputedPassword) {
        setInputError((prevError) => prevError ? prevError + "パスワードを入力してください。" : "パスワードを入力してください。")
      }
      // ユーザー名かパスワードが入力されていなければ処理を終了
      if (!inputedName || !inputedPassword) return

      try {
        // ログイン処理
        const fetchedUser = await axios.post("/api/users/signin", {
          name: userNameRef.current?.value,
          password: passwordRef.current?.value
        })
        // ログインに成功したら、ユーザー情報を state にセット
        if (fetchedUser.status === 200) {
          const user = fetchedUser.data
          userDispatch({ type: "set_user", user: user })
          // url を /user/:userId に変更
          navigate(`/user/${user.id}`)
          setToken(Cookies.get('token'))
        } else {
          setInputError("ユーザー名かパスワードが間違っています")
        }
      } catch (error) {
        userDispatch({ type: 'set_error', error: `ログイン時にエラーが発生しました。${error}` })
      }
    }
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ユーザーの新規登録の処理
  const handleSignup = useCallback<React.FormEventHandler>(async (event) => {
    event.preventDefault();
    setInputError(null)
    const fetchUser = async () => {
      const inputedName = userNameRef.current?.value
      const inputedPassword = passwordRef.current?.value

      // ユーザー名かパスワードが入力されていなければエラー文を設定
      if (!inputedName) {
        setInputError("ユーザー名を入力してください。")
      }
      if (!inputedPassword) {
        setInputError((prevError) => prevError ? prevError + "パスワードを入力してください。" : "パスワードを入力してください。")
      }
      // ユーザー名かパスワードが入力されていなければ処理を終了
      if (!inputedName || !inputedPassword) return

      try {
        const fetchedNewUserData = await axios.post("/api/users/register", {
          name: inputedName,
          password: inputedPassword
        })
        const { status, data: newUserData } = fetchedNewUserData
        if (status == 200) {
          userDispatch({ type: "set_user", user: newUserData })
          navigate(`/user/${newUserData.id}`)
          setToken(Cookies.get('token'))
        } else {
          setInputError("ユーザー名かパスワードが間違っています")
        }
      } catch (error) {
        userDispatch({ type: 'set_error', error: `新規ユーザー作成時にエラーが発生しました。${error}` })
      }
    }
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ログアウトの処理
  const toLogout = async () => {
    try {
      await axios.post("/api/users/logout", null)
      setToken(undefined)
    } catch (error) {
      console.error("ログアウト時にエラーが発生しました。", error)
    }
  }

  // ユーザーのコメント履歴の取得
  useEffect(() => {
    const fetchCommentsData = async () => {
      if (!user) return
      try {
        if (user.comments === undefined) return
        const commentsByUser: Comment[] = []
        for (const commentId of user.comments) {
          await axios.get(`/api/comments/${commentId}`).then((fetchedCommentData) => {
            commentsByUser.push(fetchedCommentData.data)
          })
        }
        commentDispatch({ type: 'set_comments', comments: commentsByUser })
      } catch (error) {
        console.error("コメントの取得でエラーが発生しました。", error);
      }
    }
    fetchCommentsData()
  }, [user])

  return (
    <>
      {isLoading ? (
        null
      ) : (
        <>
          {userError && (
            <p className="error">{userError}</p>
          )}
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
                  <button onClick={handleLogin}>ログイン</button>
                </div>
                <div>
                  <button onClick={handleSignup}>新規ユーザー作成</button>
                </div>
              </form>
            </>
          )}
        </>)
      }
    </>
  )
}
