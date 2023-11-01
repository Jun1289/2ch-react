import axios from "axios"
import { useEffect, useState } from "react";
import { ThreadForm } from "./ThreadForm";
import { Link } from "react-router-dom";
import { useUserContext } from "../state/userContext";
import { useReducer } from "react";

type Comment = {
  id: number,
  commentNo: number,
  responder: string,
  commentContent: string,
  createdAt: string,
  updatedAt: string,
  threadId: number
}

type CommentsState = {
  comments: Comment[],
  isLoading: boolean,
  currentComment: null | Comment
  error: null | string,
}

type CommentAction =
  | {
    type: "delete_comment";
    commentId: number;
  }
  | {
    type: "add_comment";
    newComment: Comment;
  }
  | {
    type: "set_comments";
    comments: Comment[];
  }
  | {
    type: "set_error";
    error: string | null;
  }

const commentsInitialState: CommentsState = {
  comments: [],
  isLoading: true,
  currentComment: null,
  error: null
}

const commentReducer = (commentsState: CommentsState, action: CommentAction) => {
  // const { comments, commentsIsLoading, error } = commentsState
  switch (action.type) {
    case 'delete_comment': {
      const newCommentsData = commentsState.comments?.filter((comment) => {
        return comment.id !== action.commentId
      }) || null;
      console.log("newCommentsData", newCommentsData)
      return {
        ...commentsState,
        comments: [...newCommentsData]
      }
      break;
    }
    case 'add_comment':
      return {
        ...commentsState,
        comments: [...commentsState.comments, action.newComment],
        error: null
      }
      break;
    case 'set_comments':
      return {
        ...commentsState,
        comments: action.comments,
        isLoading: false,
        error: null
      }
      break;
    case 'set_error':
      console.log("error", action.error)
      return {
        ...commentsState,
        error: action.error
      }
      break;
  }
}


type Thread = {
  id: number,
  title: string,
  topic: string,
  createdAt: string,
  updatedAt: string,
  commentTotal: number,
  builder: string
}

type ThreadsState = {
  threads: Thread[],
  isLoading: boolean,
  currentThread: null | Thread,
  error: null | string
}

type ThreadAction =
  | {
    type: "delete_thread";
    threadId: number;
  }
  | {
    type: "add_thread";
    newThread: Thread;
  }
  | {
    type: "set_threads";
    threads: Thread[];
  }
  | {
    type: "set_thread";
    currentThread: Thread;
  }
  | {
    type: "set_error";
    error: string | null;
  }

const threadsInitialState: ThreadsState = {
  threads: [],
  isLoading: true,
  currentThread: null,
  error: null
}

const threadsReducer = (threadsState: ThreadsState, action: ThreadAction) => {
  // const { threads, threadsIsLoading, error } = threadsState
  switch (action.type) {
    case 'delete_thread': {
      const newthreadsData = threadsState.threads?.filter((thread) => {
        return thread.id !== action.threadId
      }) || null;
      return {
        ...threadsState,
        threads: [...newthreadsData]
      }
      break;
    }
    case 'add_thread':
      console.log("add_payload : ", action.newThread)
      return {
        ...threadsState,
        threads: [...threadsState.threads, action.newThread],
        error: null
      }
      break;
    case 'set_threads':
      return {
        ...threadsState,
        threads: action.threads,
        isLoading: false,
        error: null
      }
      break;
    case 'set_thread':
      return {
        ...threadsState,
        currentThread: action.currentThread,
        isLoading: false,
      }
      break;
    case 'set_error':
      return {
        ...threadsState,
        error: action.error
      }
      break;
  }
}

export const Home = () => {
  const [commentCounts, setCommentCounts] = useState<Record<number, number>>({});
  const { userState, userDispatch } = useUserContext()
  const { user, isLoading } = userState
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const [threadsState, threadsDispatch] = useReducer(threadsReducer, threadsInitialState);

  const handleDelete = async (threadId: number, event: React.MouseEvent<Element, MouseEvent>) => {
    event.preventDefault();
    try {
      await axios.delete(`http://localhost:8000/threads/${threadId}`)
        .then(function () {
          threadsDispatch({ type: "delete_thread", threadId })
          // if (userState) {
          //   setUser((prevUser) => {
          //     if (!prevUser) return null;
          //     const islikes = prevUser?.likes.filter((like) => {
          //       return like !== threadId.toString()
          //     })
          //     console.log("after toggle : ", islikes)
          //     return ({
          //       ...prevUser,
          //       likes: islikes
          //     })
          //   })
          // }
        })
    } catch (error) {
      console.error("コメントの削除でエラーが発生しました:", error);
    }
  }

  const getCommentCnt = async (threadId: number): Promise<number> => {
    const response = await axios.get(`http://localhost:8000/threads/${threadId}/comments`)
    const comments = response.data
    return comments.length
  }

  // const handleFavorite = (event: React.MouseEvent<Element, MouseEvent>, threadId: number) => {
  //   console.log(threadId)
  //   const target = event.currentTarget

  //   const toggleFavorite = async () => {
  //     try {
  //       await axios.post(`http://localhost:8000/users/${user?.id}/toggle-favorite/${threadId}`)
  //         .then(function (response) {
  //           console.log(response.data.user)
  //           setUser(response.data.user)
  //           const islike = user?.likes.includes(threadId.toString())
  //           if (islike) {
  //             target.classList.remove('added')
  //           } else if (!islike) {
  //             target.classList?.add('added')
  //           }
  //         })
  //     } catch (error) {
  //       console.error("お気に入りの切り替えに失敗しました。", error)
  //     }
  //   }
  //   toggleFavorite()
  // }

  useEffect(() => {
    // ここで非同期データを取得
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/threads');
        threadsDispatch({ type: 'set_threads', threads: response.data })
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };
    fetchData();
  }, [])

  useEffect(() => {
    const fetchCommentCounts = async () => {
      if (threadsState.threads) {
        const counts: Record<number, number> = {};
        for (const thread of threadsState.threads) {
          counts[thread.id] = await getCommentCnt(thread.id);
        }
        setCommentCounts(counts);
      }
      commentDispatch({ type: 'set_comments', comments: [] })
    };
    fetchCommentCounts();
  }, []);

  return (
    <div>
      <ThreadForm onThreadCreated={threadsDispatch} />
      {
        (threadsState.isLoading || commentsState.isLoading) ? (
          null
        ) : (
          <section>
            <h2>スレッド一覧</h2>
            {threadsState.threads ? (
              <ul>
                {
                  threadsState.threads.map(thread => (
                    <li key={thread.id}>
                      <Link to={`/threads/${thread.id}`}>
                        <span>{thread.id}: {thread.title} ({commentCounts[thread.id] || 0})</span>
                      </Link>
                      {/*user ? (
                        <a href="#" className={user.likes.includes(thread.id.toString()) ? "added" : ""} onClick={(event) => handleFavorite(event, thread.id)}>★</a>
                      ) : (
                        null
                      )} */}
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

