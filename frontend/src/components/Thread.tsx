import axios from "axios"
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReducer } from "react";
import { CommentForm } from "./CommentForm";
import { commentReducer, commentsInitialState, threadReducer, threadsInitialState } from "../reducers/reducers";

const formatDateTime = (dateString: string) => {
  const dateObj = new Date(dateString);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day}-${hours}:${minutes}:${seconds}`;
}

export const Thread = () => {
  const { threadId } = useParams()
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const { comments, isLoading: commentsIsLoading, error: commentsError } = commentsState
  const [threadsState, threadDispatch] = useReducer(threadReducer, threadsInitialState);
  const { currentThread, isLoading: threadsIsLoading, error: threadsError } = threadsState

  // スレッドデータとコメントデータの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedThreadData = await axios.get(`/api/threads/${threadId}`)
        const threadData = fetchedThreadData.data
        threadDispatch({ type: 'set_thread', currentThread: threadData })
      } catch (error) {
        threadDispatch({ type: 'set_error', error: `スレッドデータの取得でエラーが発生しました。${error}` })
      }
      try {
        const fetchedCommentsData = await axios.get(`/api/threads/${threadId}/comments`)
        const commentsData = fetchedCommentsData.data
        commentDispatch({ type: 'set_comments', comments: commentsData })
      } catch (error) {
        commentDispatch({ type: 'set_error', error: `コメントの取得でエラーが起きました。${error}` })
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])


  return (
    <>{
      (threadsIsLoading || commentsIsLoading) ? (
        null
      ) : (
        < div className="thread-wrapper content-wrapper">
          {threadsError && (
            <p className="error">{threadsError}</p>
          )}
          {commentsError && (
            <p className="error">{commentsError}</p>
          )}
          <section>
            <p className="thread_title">{currentThread?.title}</p>
            <p>{currentThread?.topic}</p>
          </section>
          <section>
            {(comments && comments.length != 0) ? (
              <ul>
                {comments.map((comment) => (
                  <li key={`${threadId}${comment.commentNo}`}>
                    <div>
                      <span>{comment.commentNo}: {comment.commenter} : {formatDateTime(comment.createdAt)}</span>
                    </div>
                    <div>
                      {comment.commentContent}
                    </div>
                  </li>
                ))}
              </ul>
            ) :
              <div>コメントはまだありません</div>}
          </section>
          <CommentForm commentDispatch={commentDispatch} />
        </div >
      )
    }
    </>
  )
}
